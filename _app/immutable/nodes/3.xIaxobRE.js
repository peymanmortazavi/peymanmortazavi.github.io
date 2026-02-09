import"../chunks/DsnmJJEf.js";import"../chunks/C76j-4se.js";import{ax as w,f as n,t as b,a as o,ay as P,s as p,c,r as l,a3 as C,g as m,n as T}from"../chunks/DC1HeBj6.js";import{s as I}from"../chunks/om88xCLe.js";import{s as R}from"../chunks/DpiXYlSK.js";import{e as S,i as _}from"../chunks/De23LoCU.js";import{s as v}from"../chunks/Ce_L8zom.js";var k=n('<a><img class="w-8"/></a>'),A=n('<div class="flex flex-col font-mono gap-4"><span class="text-xl md:text-2xl xl:text-3xl font-semibold"> </span> <div class="w-fit flex"></div> <div class="text-justify flex-shrink-0 md:text-lg lg:text-xl xl:text-2xl"><!></div></div>');function f(h,t){w(t,!0);var i=A(),s=c(i),g=c(s,!0);l(s);var e=p(s,2);S(e,21,()=>t.links,_,(x,u)=>{var d=k(),y=c(d);l(d),b(()=>{v(d,"href",m(u).url),v(y,"src",m(u).icon),v(y,"alt",m(u).alt)}),o(x,d)}),l(e);var r=p(e,2),a=c(r);R(a,()=>t.children??C),l(r),l(i),b(()=>I(g,t.title)),o(h,i),P()}var $=n(`<ul class="space-y-4"><li>csv-zero is a CSV parsing library written in Zig that exposes a low-level, zero-allocation and SIMD-accelerated field iterator.

				It intentionally does less than typical CSV libraries. There is no record abstraction, no automatic allocation, and no opinionated data model. Instead, csv-zero provides the minimal mechanics of CSV parsing so you can build exactly what you need—explicitly and predictably—on top.

				This library is designed for systems engineers and performance-sensitive tooling where control and transparency matter more than convenience.</li> <li>C/C++ interface available, via static and shared/dynamic libraries.</li> <li>Zero allocations by default</li> <li>Use SIMD to improve performance</li> <li>Strict RFC 4180 compliance</li> <li>Benchmark data available at <strong><a href="https://github.com/peymanmortazavi/csv-race">CSV
				Race</a></strong></li></ul>`),z=n(`<ul class="space-y-4"><li>gRPC Gateway is a versatile tool that bridges the gap between gRPC
				services and HTTP-based APIs, including RESTful or WebSockets. It
				enables clients that do not support gRPC natively to communicate with
				gRPC servers using familiar HTTP and JSON formats. This capability is
				particularly valuable for integrating gRPC services into existing
				systems or for clients operating in environments where gRPC is not
				directly supported.</li> <li>The gateway seamlessly translates incoming HTTP/JSON requests into
				corresponding gRPC calls, facilitating the integration of gRPC services
				into a wide range of applications. It offers additional functionalities
				such as request/response transformation, JSON request validation, and
				customizable error handling, enhancing the flexibility and robustness of
				the integration process.</li> <li>Additionally, there is a versatile plugin that can generate a
				corresponding OpenAPI v3.1 document for the resulting HTTP API. However,
				since OpenAPI is generally meant to capture RESTful APIs, it does not
				automatically generate documentation for WebSocket bindings.</li> <li>In essence, gRPC Gateway streamlines the exposure of gRPC services to
				clients that require HTTP-based interfaces, simplifying the development
				and deployment of services that cater to diverse client environments.
				This capability is especially beneficial for clients operating in web
				browsers, where direct gRPC support may be limited.</li></ul> <div class="flex justify-center"><img class="w-full lg:w-2/3 m-12" src="/grpc-api-gateway.svg" alt="gRPC API Gateway Diagram"/></div>`,1),H=n(`<ul class="space-y-4"><li>Often, when looking to improve reliability of a service, I have found
				that health checks and shutdown processes are either not at all set up
				or not really thought through.</li> <li>There are probably many other packages that can help setup shutdown
				process and signal handling.</li> <li>I have tried to follow the golden rule to implement something small but
				really well and expandable. This package allows you to conveniently
				define shutdown procedures. If you have components that rely on each
				other, you can put them in sequence or run them in parallel and failure
				in one spot will not stop the rest of the shutdown processes.</li></ul>`),O=n('<div class="p-2 pr-4 flex flex-col gap-10 xl:gap-20 md:p-6 lg:p-10 xl:p-16"><!> <!> <!></div>');function Z(h){var t=O(),i=c(t);f(i,{title:"CSV Zero",links:[{alt:"github link",icon:"/github.svg",url:"https://github.com/peymanmortazavi/csv-zero"}],children:(e,r)=>{var a=$();o(e,a)},$$slots:{default:!0}});var s=p(i,2);f(s,{title:"gRPC API Gateway",links:[{alt:"github link",icon:"/github.svg",url:"https://meshapi.github.io/grpc-api-gateway/"}],children:(e,r)=>{var a=z();T(2),o(e,a)},$$slots:{default:!0}});var g=p(s,2);f(g,{title:"Go Shutdown",links:[{alt:"github link",icon:"/github.svg",url:"https://github.com/meshapi/go-shutdown"}],children:(e,r)=>{var a=H();o(e,a)},$$slots:{default:!0}}),l(t),o(h,t)}export{Z as component};
