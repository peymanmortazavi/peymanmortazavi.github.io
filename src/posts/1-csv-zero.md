---
title: Zero-allocation, SIMD accelerated CSV iterator
description: Journey into designing a fast CSV iterator using SIMD and avoiding dynamic memory allocations
date: 2026-02-09
---

# Introduction

CSV parsing is one of those problems that seems simple until you actually try to do it well. The format itself is deceptively straightforward, but handling quoted fields, escape sequences, and different line endings while maintaining good performance requires careful design. In this post, I'll walk through how csv-zero leverages SIMD instructions and careful state management to parse CSV files efficiently.

In this post, we journey into techniques I explored for designing a fast CSV iterator and the tradeoffs involved.
We will discuss using SIMD, avoiding dynamic allocations and reducing branches.
Then we will review methodology for benchmarking and examining the results.

If you're interested in SIMD programming, branch prediction, or systems-level optimization, you might find some useful patterns here.

I used Zig for the implementation so there will be references to the languages but the approaches are language agnostic.

### Brief introduction to CSV file format

If you are already familiar with CSV, you can safely skip this part.

CSV does have a RFC standard and you can access it [here](https://www.rfc-editor.org/rfc/rfc4180). The article does a
great job explaining the file format and it is easy to follow. We will reiterate it here as well.

A record is a collection of fields, and CSV is a collection of records where every record is on a separate line.

TBD

# Implementation

As stated, the goals for this project was for it to be fast. In order to accomplish that, there are three design
choices that I explored.

Imagine we define an iterator struct, this iterator has a `next()` function that returns the next field or an error.

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

We will obviously have more errors and more fields in the `Field` struct but this is all we need to discuss the
implementation.

The general idea is to fill the buffer, look for delimiters, once the delimiter is found, return a slice for the
current field.

```
function next():
    1. Find the next delimiter (quote, comma, or newline)

    2. If delimiter is comma or newline:
       → Return the field up to this delimiter

    3. If delimiter is quote (opening quote):
       a. Search for the closing quote
       b. After finding a quote, check the next character:
          • If it's another quote (""): escaped quote
            → Skip both quotes and continue searching
          • If it's comma or newline: end of quoted field
            → Return the quoted field
          • Otherwise if no more byte is remaining: last field
            → Return the quoted field
          • Otherwise: malformed CSV
            → Return error
```

The idea is simple but there are some corner cases that need to get covered for a correct implementation.

## Zero Allocation

Dynamic allocation can require system calls (if using heap allocations), can involve system interruptions
and consequently be expensive.
That is why emphasis has been put into designing a CSV iterator that does not need to allocate memory dynamically.

In order to avoid dynamic allocations, I made a deliberate architectural choice to iterate the fields and not the
records. The iterator scans the buffer until the next field is found and simply return
a slice into the buffer. This slice is only valid until the next iteration (calling `next()`) since the buffer
might get modified.

Many CSV libraries provide a record iterator instead, meaning that the entire record and all of its fields are
returned at once.
This does offer more convenience for the consumer in some cases, because the `next()` function would
effectively return an array of fields in the record at once.

For instance, if you wanted to read the second field of every record you can write a simpler program.

```zig
var total: usize = 0;
while (iterator.next()) |record| {
    // record is an array that holds all of the fields in the record!
    total += try std.fmt.parseInt(u32, record[1], 10);  // second field in every record!
}
```

However, this complicates the zero-allocation goal. Since the number of fields is unknown at compile time,
we either have to put an upper limit on the total count of fields to avoid dynamic allocation or give up the
zero allocation goal entirely.
One might argue that we can retain the allocated memory and have very limited dynamic memory allocation albeit not
zero. This is perhaps true if the memory allocations are limited to the field buffer but returning the records
presents another challenge. We would have to be able to fit the entire record and all of its fields in the buffer.

The limitations stated above and the focus on performance led me to choose to iterate fields instead of records.
We would not make any choice for the user to sacrifice performance, they can easily write a wrapper around our field
iterator to produce a record iterator if that is desired. Besides, there are many usecases where records are not really
needed. For instance, field clean up such as removing spaces, removing invalid numbers or file conversions such as
converting CSV to JSON or XLSX. In all of these cases, processing records instead of fields does not immediately
provide any convenience.

### Buffer sliding and fields that are too long

Since we do not allocate dynamic memory for fields (or anything else), the buffer must be able to fit the entire
field. Otherwise, we return an error indicating that the field is too long for the current buffer size. The consumer
can then resort to dynamic memory allocation or they can skip the field or just return an error. Google drive and
Excel do limit the size of each field. We can obviously provide some shortcut methods to automatically switch to
dynamic allocation for those exceptionally large fields if the user prefers but let us focus on the foundation and not
utility functions.

The challenge we need to solve here is that if the buffer can fit the field, we should be able to handle it. If the
field starts in the middle of the buffer and no delimiter is found in the remaining bytes in the buffer,
we would move the content to the beginning of the buffer and try to fill it more until there is no more room, then
continue the search from whence we left off.

![Buffer sliding and refilling](/p/1-csv-zero-buffer-sliding.svg)

## SIMD

SIMD stands for _Single Instruction, Multiple Data_ and it is a parallel computing method available in many CPU
architectures that allows a single processor instruction to perform the same operation on multiple data points.

If you are not familiar with this, I recommend reading about it online and/or read
[Zig Vectors](https://zig.guide/language-basics/vectors/).

Because SIMD is very much dependant on the CPU architecture, it is important to choose the correct length based on the
CPU architecture.
For the sake of simplicity, I will skip over all of that. Since we have figures and charts, let's assume we can hold 6
bytes in our vectors. In real world scenarios, you can have access to much larger vectors. For instance for M4 cpus you
can use 128 bits (16 bytes) or 256 bits (32 bytes).

We can apply SIMD to our problem by loading 6 bytes at a time. You can compare two vectors and get a new vector of
booleans of the same length. We can use this and delimiter masks to find all delimiter characters in a vector.

```zig
const Vector = @Vector(16, u8);
const input: Vector = my_slice[cursor..cursor+16].*;  // load 16 bytes from slice onto the vector.
const QuoteMask: Vector = @splat('"');  // creates a vector where each element is "
const CommaMask: Vector = @splat(',');
const NewLineMask: Vector = @splat('\n');
const quotes = (input == QuoteMask);
const commas = (input == CommaMask);
const newlines = (input == NewLineMask);
const delimiters = (quotes | commas | newlines);
```

![Delimiter vector compution using SIMD](/p/1-csv-zero-simd.svg)

We are able to compute a boolean vector that indicates the positions of the delimiters.

**NOTE**: The actual bit representation of `delimiters` would be in reverse, so `0b1011010`. The figure shows a more
friendly order for human eyes but this is an important detail to keep in mind.

Now we can effectively use this boolean vector as a queue that holds the position of the delimiters. As long as the
vector is not all 0s, the index of the next `1` bit is the index of the next delimiter.

From now on, most of the operations are perform on the vector, as you will see, are simple integer operations. For that
reason, we interpret the vector as a simple integer type.

```zig
// since 6 is our vector size in bytes, we need an unsigned 6-bit integer.
const Bitmask = std.meta.Int(.unsigned, 6);
const vector: Bitmask = @bitCast(delimiters);
```

**NOTE**: I found it interesting that converting this into an integer and performing integer operations leads to
significant performance gains as opposed to using `std.simd.firstTrue` or other alternatives in the `std.simd`.

### Zero checks

Since our vector is an unsigned integer type, we can simply use integer arithmetics. If `vector == 0` then it means we
have no delimiters in the current vector.

### Pop the next delimiter position

In order to find the index of the next `1` bit, we need to count the number of trailing zeros. This can be done very
cheaply using the `ctz` CPU instruction, which is available via `@ctz` in Zig:

```zig
const index = @ctz(vector);
```

We have the index now, but in order to make sure next time, we don't return the same index, we need to remove the least
significant set bit. In order to do this, we can use a common trick:

```zig
vector &= vector - 1;
```

Why does this work? because `vector - 1` turns the least significant `1` into `0` and all the less significant `0`s
into `1`s. Performing a bitwise AND with the original number then turns that original `1`-bit and all
trailing zeros into 0s, leaving higher-order bits intact.

```
A     : 0b110100;
A - 1 : 0b110011;
&     : 0b110000;
```

Some CPU architectures have a dedicated CPU instruction for this, known as BLSR. When available, compilers can easily
optimize `a & a-1 ` to BLSR.

Thus, with only two instruction we can find the index of the next set bit (`1`) and pop it off.

### Putting this into practical use

We can define a new function named `nextDelim` whose sole purpose is to return the position of the
next delimiter in the buffer.

We can define this as:

```
if self.vector is non zero:
    -> index = count of trailing zeros in self.vector
    -> pop the least significant 1
    -> return self.vector_offset + index
Otherwise
    Loop as long as cursor+6 < buffer_end:
        1. load and calculate vector as unsigned integer
        2. if vector is non-zero:
         -> store vector in the self.vector
         -> store the current buffer offset in self.vector_offset
         -> pop and retrieve the index of the next set bit
         -> return index + self.vector_offset
Otherwise, perform a byte by byte iteration until the end of the buffer

```

And the `next` function would just call `nextDelim` function as long as there is any remaining bytes in the buffer and
performing sliding and refilling as necessary until next delimiter is found, end of file is reached or buffer is full
indicating that the current field is too long.

![Pop least significant set bit](/p/1-csv-zero-vector-pop.svg)

## Handling quoted regions

A big part of the puzzle is handling the quoted regions in an efficient way. Since the logic for handling the quoted
regions is more complex and branch-heavy than the non-quoted fields, we pay for one branch to check if the current
delimiter is a double quote in the `next()` call and handle the double quotes differently. In another word, if the next
delimiter is a double quote, handle it with special logic, otherwise, treat it as an end of the field and return it.

Now the more important part, how do we handle the cases where we do have a double quote? There are some key things we
have to accomplish:

1. **Detect whether or not an escaped quote is present in the field**

   I decided to not actually perform the unescaping and let the user decide if they want to pay the price of the
   unescaping since at times we just want to determine if the field is empty, or to count fields or maybe the field is
   completely ignored due to a select operation where only some columns are used. We do, however, want to indicate in the returned `Field` struct whether or not the field needs unescaping.

1. **Find the end of the quoted region**

   We do need to find the end of the quoted region. Note that for this, we need to consume multiple delimiters.
   We need to consume the first and last quote delimiters but also if there is any comma or newline (LF or CRLF)
   delimiters, we need to consume them as well.

![FSA for handling quoted regions](/p/1-csv-zero-fsa-quotes.svg)

## Reducing code branches

Handling both CRLF and LF in CSV can seem innocent but presents a lot of challenges such as adding code branches. Code
branches such as `if` clauses, necessitate putting `jmp` instructions and causing branching mispredictions which can
creep up and become costly when you are tuning performance at this level. In order to avoid the branches we never look
for `\r` specifically. We only fish for `\n`. When `\n` is found, then we should consider whether or not the slice
should end just before `\n` or one additional character (in case the previous character is `\r`). To do this, we
compute `trim_cr` which is a single bit unsigned integer and is either `1` if the delimtier is `\n` and the previous
character is available and equal to `\r`. In such a case, we want to remove the last character from the slice.

Since this is in a hot-loop, it leads to noticeable performance gains compared to an `if` statement here. The code
below would not introduce any `jmp` instruction and therefore no risk for branch misprediction.

```zig
const prev_is_cr = @intFromBool((end != 0) and (self.reader.buffer[end - 1] == '\r'));
const is_newline = @intFromBool(delim == '\n');
const trim_cr = prev_is_cr & is_newline;
const slice = [start .. end - trim_cr];  // trim_cr is 1 only if delim is \n and the previous character is \r
```

There are some other places where a similar technique is used but this was the most impactful change.

# Benchmarking

I created a separate repository, [csv-race](https://github.com/peymanmortazavi/csv-race) to help benchmark many CSV parsers and use `perf` and other tools to create different
figures depicting cache locality, branch misprediction rate, peak RSS and of course latency.

The repository goes into further details on the methodology and each metric and it can be used to reproduce the results
on your own computer or use it compare against other parsers.

To briefly reiterate parts of it. In order to isolate the benchmark to the iteration itself, no numerical conversion or
string manipulation is used in the test. The only task is iterate every single field and count them. A fixed buffer
size of 64KB is used and various different CSV files are used. 4 small test files that are common used in CSV
benchmarks and some generated CSV files based on different criterias such as presence of quotes,
length of the fields, number of records, etc.

Here's the results from the benchmarks:

### Latency, Small Files

![Time Latency - Small Files](https://github.com/peymanmortazavi/csv-race/raw/main/images/wall_time.png)

### Latency, Large Files

![Time Latency - Large Files](https://github.com/peymanmortazavi/csv-race/raw/main/images/wall_time_xl.png)

### Branch Misses

![Time Latency - Large Files](https://github.com/peymanmortazavi/csv-race/raw/main/images/branch_misses.png)

# Conclusion

I learned a whole lot taking on designing and building a seemingly simple task of parsing CSV files. The implementation
is in [Zig](https://ziglang.org/) and is ready to use as-is. I do have some plans to add additional utilities to make it more feature-rich but
the project should be ready to use. Since C is a more popular and used language, I added an accompanying C interface
that allows you to use this library in your C/C++ code.

I do want to take a moment and express my enthusiasm and excitement for the Zig language.
Zig has a way of making programming really enjoyable and it has made it very easy to take on advanced concepts
such as custom allocators, SIMD and I/O loops.
I want to thank all of the people involved in the Zig language, there are truly amazing things happening here.
I already donate to the Zig language foundation and can only recommend you the reader to check the language out and
consider supporting it either by using it and finding bugs or talking about it or even financial means.
