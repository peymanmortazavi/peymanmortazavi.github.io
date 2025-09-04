import"../chunks/DsnmJJEf.js";import"../chunks/ChOv4RNB.js";import{ar as x,f as c,t as f,a as r,as as P,s as m,c as n,r as i,a1 as T,g as h,n as R}from"../chunks/3xeBojP4.js";import{s as C}from"../chunks/mKSCLUPQ.js";import{s as I}from"../chunks/D6EyhgL2.js";import{e as _,i as k}from"../chunks/D8-uEqVV.js";import{s as u}from"../chunks/CkXuGS9_.js";var A=c('<a><img class="w-8"/></a>'),S=c('<div class="flex flex-col font-mono gap-4"><span class="text-xl md:text-2xl xl:text-3xl font-semibold"> </span> <div class="w-fit flex"></div> <div class="text-justify flex-shrink-0 md:text-lg lg:text-xl xl:text-2xl"><!></div></div>');function y(d,e){x(e,!0);var t=S(),s=n(t),l=n(s,!0);i(s);var o=m(s,2);_(o,21,()=>e.links,k,(w,g)=>{var p=A(),v=n(p);i(p),f(()=>{u(p,"href",h(g).url),u(v,"src",h(g).icon),u(v,"alt",h(g).alt)}),r(w,p)}),i(o);var a=m(o,2),b=n(a);I(b,()=>e.children??T),i(a),i(t),f(()=>C(l,e.title)),r(d,t),P()}var H=c(`<ul class="space-y-4"><li>gRPC Gateway is a versatile tool that bridges the gap between gRPC
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
				browsers, where direct gRPC support may be limited.</li></ul> <div class="flex justify-center"><img class="w-full lg:w-2/3 m-12" src="/grpc-api-gateway.svg" alt="gRPC API Gateway Diagram"/></div>`,1),O=c(`<ul class="space-y-4"><li>Often, when looking to improve reliability of a service, I have found
				that health checks and shutdown processes are either not at all set up
				or not really thought through.</li> <li>There are probably many other packages that can help setup shutdown
				process and signal handling.</li> <li>I have tried to follow the golden rule to implement something small but
				really well and expandable. This package allows you to conveniently
				define shutdown procedures. If you have components that rely on each
				other, you can put them in sequence or run them in parallel and failure
				in one spot will not stop the rest of the shutdown processes.</li></ul>`),q=c('<div class="p-2 pr-4 md:p-6 lg:p-10 xl:p-16"><!> <!></div>');function z(d){var e=q(),t=n(e);y(t,{title:"gRPC API Gateway",links:[{alt:"github link",icon:"/github.svg",url:"https://meshapi.github.io/grpc-api-gateway/"}],children:(l,o)=>{var a=H();R(2),r(l,a)},$$slots:{default:!0}});var s=m(t,2);y(s,{title:"Go Shutdown",links:[{alt:"github link",icon:"/github.svg",url:"https://github.com/meshapi/go-shutdown"}],children:(l,o)=>{var a=O();r(l,a)},$$slots:{default:!0}}),i(e),r(d,e)}export{z as component};
