---
title: Zero-allocation, SIMD accelerated CSV iterator
description: Journey into designing a fast CSV iterator using SIMD and avoiding dynamic memory allocations
date: 2026-02-09
---

# Introduction

CSV parsing is one of those problems that looks trivial until you try to do it _well_. The format itself is simple, but supporting quoted fields, escape sequences, and multiple line-ending conventions—while still delivering high throughput—requires careful design.

In this post, I’ll walk through the design of **csv-zero**, a SIMD-accelerated, zero-allocation CSV iterator. We’ll explore the techniques used to achieve high performance, the tradeoffs involved, and the constraints that shaped the final architecture.

Specifically, we’ll cover:

- Why iterating _fields_ instead of _records_ enables zero allocation
- How SIMD can be used to efficiently locate CSV delimiters
- How branch reduction improves performance in hot loops
- How quoted fields are handled
- The benchmarking methodology used to evaluate these choices

If you’re interested in SIMD programming, branch prediction, or systems-level optimization, you may find some reusable patterns here.

The implementation is written in **Zig**, so examples reference Zig syntax and semantics, but the underlying ideas are largely language-agnostic and applicable to C, C++, Rust, or similar systems languages.

## A brief introduction to the CSV format

If you are already familiar with CSV, feel free to skip this section.

CSV does have an RFC specification—[RFC 4180](https://www.rfc-editor.org/rfc/rfc4180)—which is concise and readable. Below is a distilled version of the rules relevant to this discussion.

At a high level:

- A CSV file is a sequence of **records**
- Each record appears on its own line
- Each record consists of one or more **fields**, separated by commas

### Fields

A field may be either:

1. **Unquoted**, containing any characters except commas, quotes, or line breaks
2. **Quoted**, enclosed in double quotes (`"`)

Quoted fields may contain:

- Commas
- Line breaks
- Escaped quotes, represented as two consecutive double quotes (`""`)

Examples:

```
a,b,c
"hello, world",42,"foo""bar"
```

### Line endings

Records may be terminated by:

- LF (`\n`)
- CRLF (`\r\n`)

A correct parser must handle both.

Understanding these rules is critical for parser implementation because each rule introduces branching logic and state management that impacts performance.

# Implementation overview

The primary goal of csv-zero is **performance**, with the explicit constraint of **zero dynamic allocation** in the iterator. To achieve this, the implementation focuses on three main design choices:

1. Iterating over **fields**, not records
2. Using **SIMD** to locate delimiters
3. Reducing **branches** in hot paths

The core abstraction is an iterator with a `next()` method that returns the next field or an error.

```zig
const Field = struct {
    data: []u8,
    last_column: bool,
    needs_unescape: bool,
};

const IteratorError = error{ EOF, FieldTooLong };

const Iterator = struct {
    pub fn next() IteratorError!Field {
        // ...
    }
};
```

The production implementation includes additional error types and field metadata, but this simplified interface captures the essential contract.

Conceptually, the iterator works as follows:

1. Scan the buffer for the next delimiter (comma, newline, or quote)
2. If the delimiter is a comma or newline:

   - Return the field up to that point

3. If the delimiter is a quote:

   - Enter quoted-field handling logic:

     - Search for the matching closing quote
     - Handle escaped quotes (`""`)
     - Validate the character following the closing quote
     - Return the quoted field or an error

In pseudocode:

```
function next():
    find next delimiter (quote, comma, newline)

    if delimiter is comma or newline:
        return field

    if delimiter is quote:
        loop:
            find next quote
            if escaped quote:
                skip
            else if followed by comma or newline:
                return field
            else if end of input:
                return field
            else:
                error
```

While the algorithm appears straightforward, correct implementation requires careful handling of buffer boundaries, escape sequences, and line ending variations. The following sections detail how SIMD, zero-allocation, and branch reduction address these challenges.

## Zero Allocation

Dynamic memory allocation introduces overhead that compounds at scale. Even with efficient allocators, allocations involve:

- Allocator bookkeeping and metadata updates
- Potential cache pollution from accessing allocator data structures
- Memory fragmentation over time
- Unpredictable latency, especially with general-purpose allocators like `malloc`/`free`

While arena allocators and custom allocation strategies can mitigate some of these costs, eliminating allocations entirely is more efficient. This is why csv-zero is architected to operate entirely on a fixed-size buffer without any dynamic allocations during parsing.

To completely avoid dynamic allocation, csv-zero deliberately iterates over **fields**, not **records**.

Instead of returning an array of fields for each record, the iterator returns one field at a time as a slice into an internal buffer. That slice is valid only until the next call to `next()`, at which point the buffer may be reused or refilled.

This design choice has consequences.

### Why not record iteration?

Many CSV libraries expose a record-oriented API:

```zig
while (iterator.next()) |record| {
    total += parseInt(record[1]);
}
```

This is convenient, but fundamentally incompatible with zero allocation:

- The number of fields per record is not known at compile time
- Returning a record requires storing all field slices somewhere
- That storage must either be dynamically allocated or capped at an arbitrary maximum

You _can_ mitigate this by reusing allocations, but at that point the design is no longer truly allocation-free. You still have to buffer the entire record, which places a significant constraint on the iterator and, in practice, often pushes users back toward explicit memory allocation anyway.

By iterating over fields instead, csv-zero avoids all of these issues. Users who want record-level iteration can easily build it on top of the field iterator, while users focused on streaming transformations—filtering, validation, conversion—avoid unnecessary buffering entirely.

In many practical workloads (e.g. CSV → JSON conversion, column selection, data cleanup), record materialization provides little benefit.

## Buffer sliding and oversized fields

Because fields are returned as slices into a fixed buffer, the buffer must be large enough to hold the largest field encountered. If a field exceeds the buffer size, the iterator returns a `FieldTooLong` error, allowing the caller to decide how to proceed (allocate dynamically, skip the field, abort, etc.).

The key challenge is maximizing buffer utilization. If a field starts in the middle of the buffer and extends beyond the current buffered data, we need to:

1. **Slide** the partial field to the beginning of the buffer using `@memmove`
2. **Fill** the remaining buffer space by reading more data from the input stream
3. **Resume** scanning from where we left off

This sliding window technique ensures that any field smaller than the buffer size can be parsed, regardless of its alignment within the input stream.

![Buffer sliding and refilling](/p/1-csv-zero-buffer-sliding.svg)

## SIMD-accelerated delimiter scanning

SIMD (_Single Instruction, Multiple Data_) allows a single CPU instruction to operate on multiple data elements simultaneously.
This data-level parallelism is ideal for operations like searching for delimiters, where we need to compare many bytes against the same set of characters.
Modern CPUs support wide vector registers (128–512 bits, 16-64 bytes).

If you're unfamiliar with SIMD, I recommend reading about [Zig Vectors](https://zig.guide/language-basics/vectors/) or reviewing your architecture's SIMD instruction set documentation.

In csv-zero, SIMD is used to locate delimiter characters—quotes (`"`), commas (`,`), and newlines (`\n`)—by processing multiple bytes at once.

Using Zig vectors:

```zig
const Vector = @Vector(16, u8);
const input: Vector = buffer[cursor..cursor+16].*; // Load 16 bytes from buffer.

const quotes   = input == @splat('"');
const commas   = input == @splat(',');
const newlines = input == @splat('\n');

const delimiters = (quotes | commas | newlines);
```

This produces a vector of booleans indicating the positions of delimiter characters.
The entire operation executes in just a few SIMD instructions, processing 16+ bytes in parallel.

Note that `@splat` in Zig creates an array or vector where each element is set to the same scalar value.

For illustration purposes in this article, we'll use 6-byte vectors to keep diagrams readable. In production, csv-zero automatically selects the optimal vector length for the target architecture at compile time.

![Delimiter vector compution using SIMD](/p/1-csv-zero-simd.svg)

**NOTE**: The actual bit representation of `delimiters` uses little-endian bit ordering (LSB = index 0). The diagram shows a human-friendly left-to-right ordering for readability, but the implementation must account for the actual CPU representation when extracting bit positions.

To efficiently consume this result, the boolean vector is bit-cast to an integer:

```zig
const Bitmask = std.meta.Int(.unsigned, 16);
const mask: Bitmask = @bitCast(delimiters);
```

This enables fast integer operations instead of higher-level SIMD helpers.

### Why integers instead of SIMD helpers?

In practice, treating the mask as an integer and using bit-twiddling operations (`@ctz`, `&=`) proved significantly faster than calling helper functions like `std.simd.firstTrue`.

Additionally, from now on, most of the operations, as you will see, are simple integer operations.

## Finding and consuming delimiters

Once the delimiter mask is available:

- If `mask == 0`, there are no delimiters in this chunk
- Otherwise, find the index of the next delimiter in `mask`

To find the position of the next delimiter, we need to locate the least significant set bit (the rightmost `1`) in our bitmask. This is done efficiently using the **count trailing zeros** (CTZ) instruction:

```zig
const index = @ctz(mask);
```

The CTZ instruction counts the number of consecutive zero bits starting from the LSB, which directly gives us the bit index. On x86-64, this compiles to a single `TZCNT` or `BSF` instruction.

To avoid returning the same delimiter again, the least significant set bit is cleared:

```zig
mask &= mask - 1;
```

This classic trick compiles down to a single instruction on many architectures (e.g. `BLSR`).

**Why this works**: Subtracting 1 from a number flips all trailing zeros to ones and flips the rightmost `1` to `0`. The bitwise AND then clears everything up to and including that bit:

```
A     : 0b110100  (original)
A - 1 : 0b110011  (rightmost 1 becomes 0, trailing 0s become 1s)
&     : 0b110000  (AND clears the rightmost 1 and all trailing bits)
```

This gives us a two-instruction loop for iterating through set bits: CTZ to find the position, then clear the bit. Effectively using the `mask` integer variable as a queue. This is significantly faster than scalar iteration or branching based on individual bit tests.

## Integrating SIMD into the iterator

A helper like `nextDelim()` encapsulates this logic:

- If a cached delimiter mask exists, pop from it
- Otherwise:

  - Load the next SIMD chunk
  - Compute the delimiter mask
  - Cache it and return the first delimiter

- Fall back to byte-by-byte scanning near buffer boundaries

The main `next()` function repeatedly calls `nextDelim()` until it can return a field, refill the buffer, or signal EOF or error.

![Pop least significant set bit](/p/1-csv-zero-vector-pop.svg)

## Handling quoted fields

Quoted fields introduce complexity and branching. To keep the fast path fast, csv-zero separates quoted and unquoted logic early:

- If the next delimiter is **not** a quote, it is treated as a field boundary
- If it **is** a quote, a dedicated quoted-field routine is entered

Key goals when handling quoted fields:

1. **Detect escaped quotes**
   Escaped quotes (`""`) are detected but not immediately unescaped. Instead, the returned `Field` includes a `needs_unescape` flag, allowing the caller to decide whether to pay the cost.

2. **Locate the closing quote and trailing delimiter**
   The parser must consume:

   - The opening quote
   - Any escaped quotes
   - The closing quote
   - The following comma or newline (if present)

This logic is implemented as a small finite-state automaton, consuming delimiters until the quoted region is complete.

![FSA for handling quoted regions](/p/1-csv-zero-fsa-quotes.svg)

## Reducing branches in hot loops

Modern CPUs rely on branch prediction to maintain instruction pipeline efficiency. When a branch is mispredicted, the pipeline must be flushed, incurring a substantial cycle penalty. In tight loops processing millions of fields, even infrequent mispredictions compound into measurable overhead.

At this level of optimization, branch misprediction becomes a real cost.

One notable example is handling both LF and CRLF line endings. Rather than branching on `\r`, the parser only checks for `\n`. If the delimiter is `\n`, a branch-free computation determines whether the preceding byte was `\r` and trims it if necessary:

```zig
// Branching version (susceptible to misprediction)
if (delim == '\n' and end > 0 and buffer[end - 1] == '\r') {
    return buffer[start .. end - 1];  // Trim \r
} else {
    return buffer[start .. end];
}

// Branch-free version
const prev_is_cr = @intFromBool(end != 0 and buffer[end - 1] == '\r');
const is_newline = @intFromBool(delim == '\n');
const trim_cr = prev_is_cr & is_newline;  // 1 if we need to trim \r, 0 otherwise

return buffer[start .. end - trim_cr];
```

This avoids conditional jumps entirely, reducing misprediction in a hot path.

Similar techniques are used elsewhere, but this change alone produced measurable improvements.

# Benchmarking

Rigorous benchmarking is critical for validating optimization claims. I created [csv-race](https://github.com/peymanmortazavi/csv-race), a benchmarking harness that compares multiple CSV parsers using Linux `perf` and other profiling tools. The repository provides reproducible methodology for generating performance metrics:

- **Wall-clock latency**: Total time to process the file
- **Branch miss rate**: Percentage of branch mispredictions
- **Cache locality**: Cache miss statistics
- **Peak RSS**: Maximum resident set size (memory usage)

**Methodology**: To isolate parser performance from downstream processing, the benchmark measures only iteration throughput—no numerical conversion, string manipulation, or data structure building. The task is simply to iterate every field and count them. All parsers use a fixed 64KB buffer to ensure fair comparison.

**Test corpus**: The benchmark suite includes commonly-used CSV files (WorldCities, NFL games) plus synthetically generated files with controlled characteristics:

- Varying record counts (different file sizes)
- Varying field lengths
- Varying column counts
- Files with and without quoted fields

This diversity ensures the benchmarks reflect real-world CSV file heterogeneity rather than overfitting to a single pattern.

Here's the results from the benchmarks:

### Latency (small files)

![Time Latency - Small Files](https://github.com/peymanmortazavi/csv-race/raw/main/images/wall_time.png)

### Latency (large files)

![Time Latency - Large Files](https://github.com/peymanmortazavi/csv-race/raw/main/images/wall_time_xl.png)

### Branch misses

![Branch Misses](https://github.com/peymanmortazavi/csv-race/raw/main/images/branch_misses.png)

# Conclusion

Designing a fast CSV parser turned out to be a far richer problem than it initially appeared. By committing to zero allocation, leveraging SIMD for delimiter detection, and aggressively reducing branches, csv-zero achieves high throughput while remaining simple and predictable.

The implementation is available at [github.com/peymanmortazavi/csv-zero](https://github.com/peymanmortazavi/csv-zero) and is ready to use. I have plans to add additional utilities, but the core library is production-ready. A C-compatible interface is included for integration with C/C++ projects.

I want to express my enthusiasm for the Zig language. Zig has made exploring low-level concepts—custom allocators, SIMD via @Vector, explicit memory control, and compile-time code generation—both accessible and enjoyable. There are many factors to consider when choosing a programming language, but for me, Zig is by far the most enjoyable language to work in—and that enjoyment is not limited to low-level programming.

I want to thank everyone involved in the Zig language and its community. I already support the Zig Software Foundation and encourage you to explore the language, contribute bug reports, share your experiences, or support it financially if it resonates with you.
