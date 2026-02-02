// Bagely Bytes Programming - Main JavaScript

// Language Data
const languageData = {
    python: {
        name: 'Python',
        icon: 'fab fa-python',
        color: '#3776AB',
        tagline: 'Simple, readable, and incredibly powerful',
        year: '1991',
        popularity: '#1',
        description: 'Python is the most beginner-friendly programming language. Its clean, readable syntax makes it perfect for learning. It\'s used by Google, Netflix, Instagram, and NASA.',
        useCases: [{
                icon: 'fas fa-brain',
                title: 'AI & Machine Learning',
                desc: 'TensorFlow, PyTorch'
            },
            {
                icon: 'fas fa-chart-bar',
                title: 'Data Science',
                desc: 'Pandas, NumPy'
            },
            {
                icon: 'fas fa-globe',
                title: 'Web Development',
                desc: 'Django, Flask'
            },
            {
                icon: 'fas fa-robot',
                title: 'Automation',
                desc: 'Scripts & Bots'
            },
            {
                icon: 'fas fa-flask',
                title: 'Scientific Research',
                desc: 'Research tools'
            },
            {
                icon: 'fas fa-cogs',
                title: 'DevOps',
                desc: 'Ansible, scripts'
            }
        ],
        pros: ['Very easy to read and write', 'Huge library collection', 'Great community support',
            'Works for many purposes', 'Perfect for beginners'
        ],
        cons: ['Slower than compiled languages', 'Not great for mobile apps', 'Uses more memory',
            'Runtime errors can surprise you'
        ],
        examples: {
            'Hello World': {
                file: 'hello.py',
                code: `<span class="comment"># Your first Python program!</span>\n<span class="function">print</span>(<span class="string">"Hello, World!"</span>)\n\n<span class="comment"># Variables are easy</span>\nname = <span class="string">"Bagely Bytes"</span>\n<span class="function">print</span>(<span class="string">f"Welcome to {name}!"</span>)`
            },
            'Variables': {
                file: 'variables.py',
                code: `<span class="comment"># Python figures out types for you</span>\nmessage = <span class="string">"Hello"</span>      <span class="comment"># Text (string)</span>\nage = <span class="number">25</span>                <span class="comment"># Number (integer)</span>\nprice = <span class="number">19.99</span>           <span class="comment"># Decimal (float)</span>\nis_student = <span class="keyword">True</span>       <span class="comment"># Yes/No (boolean)</span>\n\n<span class="comment"># Lists hold multiple items</span>\nfruits = [<span class="string">"apple"</span>, <span class="string">"banana"</span>, <span class="string">"cherry"</span>]`
            },
            'Loops': {
                file: 'loops.py',
                code: `<span class="comment"># Count from 0 to 4</span>\n<span class="keyword">for</span> i <span class="keyword">in</span> <span class="function">range</span>(<span class="number">5</span>):\n    <span class="function">print</span>(<span class="string">f"Count: {i}"</span>)\n\n<span class="comment"># Loop through a list</span>\ncolors = [<span class="string">"red"</span>, <span class="string">"green"</span>, <span class="string">"blue"</span>]\n<span class="keyword">for</span> color <span class="keyword">in</span> colors:\n    <span class="function">print</span>(color)`
            },
            'Functions': {
                file: 'functions.py',
                code: `<span class="comment"># Create a reusable function</span>\n<span class="keyword">def</span> <span class="function">greet</span>(name):\n    <span class="keyword">return</span> <span class="string">f"Hello, {name}!"</span>\n\n<span class="comment"># Use the function</span>\nmessage = <span class="function">greet</span>(<span class="string">"World"</span>)\n<span class="function">print</span>(message)  <span class="comment"># Hello, World!</span>`
            }
        }
    },
    javascript: {
        name: 'JavaScript',
        icon: 'fab fa-js',
        color: '#F7DF1E',
        tagline: 'The language that powers the web',
        year: '1995',
        popularity: '#2',
        description: 'JavaScript runs in every web browser and makes websites interactive. With Node.js, it can also run on servers. It\'s the most widely used programming language.',
        useCases: [{
                icon: 'fas fa-laptop-code',
                title: 'Frontend Web',
                desc: 'React, Vue, Angular'
            },
            {
                icon: 'fas fa-server',
                title: 'Backend',
                desc: 'Node.js, Express'
            },
            {
                icon: 'fas fa-mobile-alt',
                title: 'Mobile Apps',
                desc: 'React Native'
            },
            {
                icon: 'fas fa-desktop',
                title: 'Desktop Apps',
                desc: 'Electron'
            },
            {
                icon: 'fas fa-gamepad',
                title: 'Games',
                desc: 'Phaser, Three.js'
            },
            {
                icon: 'fas fa-cloud',
                title: 'Serverless',
                desc: 'AWS, Vercel'
            }
        ],
        pros: ['Runs everywhere (browsers)', 'Full-stack capable', 'Huge ecosystem (npm)',
            'Great for interactive UIs', 'Tons of job opportunities'
        ],
        cons: ['Can be quirky/confusing', 'Type errors are common', 'Browser differences',
            'Easy to write messy code'
        ],
        examples: {
            'Hello World': {
                file: 'hello.js',
                code: `<span class="comment">// Your first JavaScript program!</span>\n<span class="function">console.log</span>(<span class="string">"Hello, World!"</span>);\n\n<span class="comment">// Variables</span>\n<span class="keyword">let</span> name = <span class="string">"Bagely Bytes"</span>;\n<span class="function">console.log</span>(<span class="string">\`Welcome to \${name}!\`</span>);`
            },
            'Variables': {
                file: 'variables.js',
                code: `<span class="comment">// Different ways to declare variables</span>\n<span class="keyword">let</span> message = <span class="string">"Hello"</span>;     <span class="comment">// Can change</span>\n<span class="keyword">const</span> PI = <span class="number">3.14159</span>;        <span class="comment">// Cannot change</span>\n\n<span class="comment">// Arrays</span>\n<span class="keyword">let</span> fruits = [<span class="string">"apple"</span>, <span class="string">"banana"</span>];\n\n<span class="comment">// Objects</span>\n<span class="keyword">let</span> person = {\n    name: <span class="string">"Alex"</span>,\n    age: <span class="number">25</span>\n};`
            },
            'Loops': {
                file: 'loops.js',
                code: `<span class="comment">// Classic for loop</span>\n<span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="number">0</span>; i < <span class="number">5</span>; i++) {\n    <span class="function">console.log</span>(<span class="string">\`Count: \${i}\`</span>);\n}\n\n<span class="comment">// Loop through array</span>\n<span class="keyword">const</span> colors = [<span class="string">"red"</span>, <span class="string">"green"</span>, <span class="string">"blue"</span>];\ncolors.<span class="function">forEach</span>(color => {\n    <span class="function">console.log</span>(color);\n});`
            },
            'Functions': {
                file: 'functions.js',
                code: `<span class="comment">// Regular function</span>\n<span class="keyword">function</span> <span class="function">greet</span>(name) {\n    <span class="keyword">return</span> <span class="string">\`Hello, \${name}!\`</span>;\n}\n\n<span class="comment">// Arrow function (modern)</span>\n<span class="keyword">const</span> <span class="function">add</span> = (a, b) => a + b;\n\n<span class="function">console.log</span>(<span class="function">greet</span>(<span class="string">"World"</span>));\n<span class="function">console.log</span>(<span class="function">add</span>(<span class="number">5</span>, <span class="number">3</span>));`
            }
        }
    },
    java: {
        name: 'Java',
        icon: 'fab fa-java',
        color: '#ED8B00',
        tagline: 'Write once, run anywhere',
        year: '1995',
        popularity: '#3',
        description: 'Java is a robust, object-oriented language used by millions of developers. It powers Android apps, enterprise software, and large-scale systems at companies like Amazon and Google.',
        useCases: [{
                icon: 'fas fa-mobile-alt',
                title: 'Android Apps',
                desc: 'Native development'
            },
            {
                icon: 'fas fa-building',
                title: 'Enterprise',
                desc: 'Banks, corporations'
            },
            {
                icon: 'fas fa-server',
                title: 'Backend',
                desc: 'Spring Boot'
            },
            {
                icon: 'fas fa-database',
                title: 'Big Data',
                desc: 'Hadoop, Spark'
            },
            {
                icon: 'fas fa-cloud',
                title: 'Cloud',
                desc: 'AWS, Azure'
            },
            {
                icon: 'fas fa-cogs',
                title: 'Microservices',
                desc: 'Scalable systems'
            }
        ],
        pros: ['Works on any platform', 'Very stable and reliable', 'Great IDE support', 'Huge job market',
            'Strong type safety'
        ],
        cons: ['More verbose than Python', 'Slower startup time', 'Uses more memory',
            'Steeper learning curve'
        ],
        examples: {
            'Hello World': {
                file: 'Hello.java',
                code: `<span class="comment">// Java programs need a class</span>\n<span class="keyword">public class</span> <span class="type">Hello</span> {\n    <span class="keyword">public static void</span> <span class="function">main</span>(<span class="type">String</span>[] args) {\n        <span class="type">System</span>.out.<span class="function">println</span>(<span class="string">"Hello, World!"</span>);\n    }\n}`
            },
            'Variables': {
                file: 'Variables.java',
                code: `<span class="comment">// Java requires type declarations</span>\n<span class="type">String</span> message = <span class="string">"Hello"</span>;\n<span class="type">int</span> age = <span class="number">25</span>;\n<span class="type">double</span> price = <span class="number">19.99</span>;\n<span class="type">boolean</span> isStudent = <span class="keyword">true</span>;\n\n<span class="comment">// Arrays</span>\n<span class="type">String</span>[] fruits = {<span class="string">"apple"</span>, <span class="string">"banana"</span>};`
            },
            'Loops': {
                file: 'Loops.java',
                code: `<span class="comment">// For loop</span>\n<span class="keyword">for</span> (<span class="type">int</span> i = <span class="number">0</span>; i < <span class="number">5</span>; i++) {\n    <span class="type">System</span>.out.<span class="function">println</span>(<span class="string">"Count: "</span> + i);\n}\n\n<span class="comment">// For-each loop</span>\n<span class="type">String</span>[] colors = {<span class="string">"red"</span>, <span class="string">"green"</span>};\n<span class="keyword">for</span> (<span class="type">String</span> color : colors) {\n    <span class="type">System</span>.out.<span class="function">println</span>(color);\n}`
            },
            'Classes': {
                file: 'Person.java',
                code: `<span class="keyword">public class</span> <span class="type">Person</span> {\n    <span class="keyword">private</span> <span class="type">String</span> name;\n    <span class="keyword">private</span> <span class="type">int</span> age;\n\n    <span class="keyword">public</span> <span class="function">Person</span>(<span class="type">String</span> name, <span class="type">int</span> age) {\n        <span class="keyword">this</span>.name = name;\n        <span class="keyword">this</span>.age = age;\n    }\n\n    <span class="keyword">public</span> <span class="type">String</span> <span class="function">greet</span>() {\n        <span class="keyword">return</span> <span class="string">"Hi, I'm "</span> + name;\n    }\n}`
            }
        }
    },
    csharp: {
        name: 'C#',
        icon: 'fas fa-hashtag',
        color: '#239120',
        tagline: 'Modern, versatile, and powerful',
        year: '2000',
        popularity: '#5',
        description: 'C# is Microsoft\'s flagship language. It\'s the primary language for Unity game development, making it hugely popular for creating video games, as well as Windows apps and web applications.',
        useCases: [{
                icon: 'fas fa-gamepad',
                title: 'Game Dev',
                desc: 'Unity Engine'
            },
            {
                icon: 'fas fa-desktop',
                title: 'Windows Apps',
                desc: 'WPF, WinForms'
            },
            {
                icon: 'fas fa-globe',
                title: 'Web',
                desc: 'ASP.NET, Blazor'
            },
            {
                icon: 'fas fa-vr-cardboard',
                title: 'VR/AR',
                desc: 'HoloLens'
            },
            {
                icon: 'fas fa-cloud',
                title: 'Azure Cloud',
                desc: 'Cloud services'
            },
            {
                icon: 'fas fa-mobile-alt',
                title: 'Mobile',
                desc: 'Xamarin, MAUI'
            }
        ],
        pros: ['Perfect for Unity games', 'Modern language features', 'Great IDE (Visual Studio)',
            'Strong type system', 'Cross-platform now'
        ],
        cons: ['Historically Windows-only', 'Learning curve for OOP', 'Less popular outside .NET',
            'Some features are complex'
        ],
        examples: {
            'Hello World': {
                file: 'Program.cs',
                code: `<span class="comment">// Modern C# is clean!</span>\n<span class="type">Console</span>.<span class="function">WriteLine</span>(<span class="string">"Hello, World!"</span>);\n\n<span class="comment">// Or the traditional way:</span>\n<span class="keyword">namespace</span> MyApp {\n    <span class="keyword">class</span> <span class="type">Program</span> {\n        <span class="keyword">static void</span> <span class="function">Main</span>() {\n            <span class="type">Console</span>.<span class="function">WriteLine</span>(<span class="string">"Hello!"</span>);\n        }\n    }\n}`
            },
            'Variables': {
                file: 'Variables.cs',
                code: `<span class="comment">// Explicit types</span>\n<span class="type">string</span> message = <span class="string">"Hello"</span>;\n<span class="type">int</span> age = <span class="number">25</span>;\n<span class="type">double</span> price = <span class="number">19.99</span>;\n<span class="type">bool</span> isStudent = <span class="keyword">true</span>;\n\n<span class="comment">// Or let C# figure it out</span>\n<span class="keyword">var</span> name = <span class="string">"Alex"</span>;\n\n<span class="comment">// Lists</span>\n<span class="type">List</span><<span class="type">string</span>> fruits = <span class="keyword">new</span>() {\n    <span class="string">"apple"</span>, <span class="string">"banana"</span>\n};`
            },
            'Loops': {
                file: 'Loops.cs',
                code: `<span class="comment">// For loop</span>\n<span class="keyword">for</span> (<span class="type">int</span> i = <span class="number">0</span>; i < <span class="number">5</span>; i++) {\n    <span class="type">Console</span>.<span class="function">WriteLine</span>(<span class="string">$"Count: {i}"</span>);\n}\n\n<span class="comment">// Foreach</span>\n<span class="type">string</span>[] colors = { <span class="string">"red"</span>, <span class="string">"green"</span> };\n<span class="keyword">foreach</span> (<span class="keyword">var</span> color <span class="keyword">in</span> colors) {\n    <span class="type">Console</span>.<span class="function">WriteLine</span>(color);\n}`
            },
            'Classes': {
                file: 'Person.cs',
                code: `<span class="keyword">public class</span> <span class="type">Person</span> {\n    <span class="comment">// Properties (modern C#)</span>\n    <span class="keyword">public</span> <span class="type">string</span> Name { <span class="keyword">get</span>; <span class="keyword">set</span>; }\n    <span class="keyword">public</span> <span class="type">int</span> Age { <span class="keyword">get</span>; <span class="keyword">set</span>; }\n\n    <span class="keyword">public</span> <span class="type">string</span> <span class="function">Greet</span>() =>\n        <span class="string">$"Hi, I'm {Name}"</span>;\n}`
            }
        }
    },
    cpp: {
        name: 'C++',
        icon: 'fas fa-microchip',
        color: '#00599C',
        tagline: 'Maximum performance and control',
        year: '1985',
        popularity: '#4',
        description: 'C++ gives you direct control over hardware and memory, making it the fastest choice for performance-critical applications. It powers game engines, operating systems, and browsers.',
        useCases: [{
                icon: 'fas fa-gamepad',
                title: 'Game Engines',
                desc: 'Unreal Engine'
            },
            {
                icon: 'fas fa-desktop',
                title: 'Operating Systems',
                desc: 'Windows, Linux'
            },
            {
                icon: 'fas fa-globe',
                title: 'Browsers',
                desc: 'Chrome, Firefox'
            },
            {
                icon: 'fas fa-microchip',
                title: 'Embedded',
                desc: 'IoT, hardware'
            },
            {
                icon: 'fas fa-rocket',
                title: 'High Performance',
                desc: 'Trading, simulations'
            },
            {
                icon: 'fas fa-database',
                title: 'Databases',
                desc: 'MySQL, MongoDB'
            }
        ],
        pros: ['Blazing fast performance', 'Direct hardware control', 'Industry standard for games',
            'Huge legacy codebase', 'Low-level access'
        ],
        cons: ['Steep learning curve', 'Manual memory management', 'Easy to create bugs', 'Complex syntax',
            'Longer compile times'
        ],
        examples: {
            'Hello World': {
                file: 'hello.cpp',
                code: `<span class="keyword">#include</span> <span class="string">&lt;iostream&gt;</span>\n\n<span class="type">int</span> <span class="function">main</span>() {\n    std::<span class="function">cout</span> << <span class="string">"Hello, World!"</span>\n              << std::endl;\n    <span class="keyword">return</span> <span class="number">0</span>;\n}`
            },
            'Variables': {
                file: 'variables.cpp',
                code: `<span class="keyword">#include</span> <span class="string">&lt;string&gt;</span>\n\n<span class="comment">// C++ needs explicit types</span>\nstd::<span class="type">string</span> message = <span class="string">"Hello"</span>;\n<span class="type">int</span> age = <span class="number">25</span>;\n<span class="type">double</span> price = <span class="number">19.99</span>;\n<span class="type">bool</span> isStudent = <span class="keyword">true</span>;\n\n<span class="comment">// Auto can infer types</span>\n<span class="keyword">auto</span> name = <span class="string">"Alex"</span>;`
            },
            'Loops': {
                file: 'loops.cpp',
                code: `<span class="comment">// For loop</span>\n<span class="keyword">for</span> (<span class="type">int</span> i = <span class="number">0</span>; i < <span class="number">5</span>; i++) {\n    std::<span class="function">cout</span> << <span class="string">"Count: "</span> << i << std::endl;\n}\n\n<span class="comment">// Range-based for (modern C++)</span>\nstd::<span class="type">vector</span><<span class="type">string</span>> colors = {<span class="string">"red"</span>, <span class="string">"green"</span>};\n<span class="keyword">for</span> (<span class="keyword">const auto</span>& c : colors) {\n    std::<span class="function">cout</span> << c << std::endl;\n}`
            },
            'Classes': {
                file: 'Person.cpp',
                code: `<span class="keyword">class</span> <span class="type">Person</span> {\n<span class="keyword">private</span>:\n    std::<span class="type">string</span> name;\n    <span class="type">int</span> age;\n\n<span class="keyword">public</span>:\n    <span class="function">Person</span>(std::<span class="type">string</span> n, <span class="type">int</span> a)\n        : name(n), age(a) {}\n\n    std::<span class="type">string</span> <span class="function">greet</span>() {\n        <span class="keyword">return</span> <span class="string">"Hi, I'm "</span> + name;\n    }\n};`
            }
        }
    },
    typescript: {
        name: 'TypeScript',
        icon: 'fas fa-code',
        color: '#3178C6',
        tagline: 'JavaScript that scales',
        year: '2012',
        popularity: 'Rising Fast',
        description: 'TypeScript adds static types to JavaScript, catching errors before your code runs. It\'s created by Microsoft and is becoming the standard for large JavaScript projects.',
        useCases: [{
                icon: 'fas fa-building',
                title: 'Large Apps',
                desc: 'Enterprise scale'
            },
            {
                icon: 'fas fa-laptop-code',
                title: 'React/Angular',
                desc: 'Frontend frameworks'
            },
            {
                icon: 'fas fa-server',
                title: 'Backend',
                desc: 'Node.js, NestJS'
            },
            {
                icon: 'fas fa-users',
                title: 'Team Projects',
                desc: 'Better collaboration'
            },
            {
                icon: 'fas fa-shield-alt',
                title: 'Type Safety',
                desc: 'Catch errors early'
            },
            {
                icon: 'fas fa-tools',
                title: 'Better Tooling',
                desc: 'Autocomplete, refactor'
            }
        ],
        pros: ['Catches errors while coding', 'Better IDE autocomplete', 'Easier to refactor',
            'Works with all JS code', 'Great for teams'
        ],
        cons: ['Extra learning on top of JS', 'Requires build step', 'Can be verbose',
            'Some library types incomplete'
        ],
        examples: {
            'Hello World': {
                file: 'hello.ts',
                code: `<span class="comment">// TypeScript = JavaScript + types</span>\n<span class="keyword">const</span> message: <span class="type">string</span> = <span class="string">"Hello, World!"</span>;\n<span class="function">console.log</span>(message);\n\n<span class="comment">// Types are often inferred</span>\n<span class="keyword">const</span> name = <span class="string">"Bagely Bytes"</span>;  <span class="comment">// string</span>`
            },
            'Types': {
                file: 'types.ts',
                code: `<span class="comment">// Basic types</span>\n<span class="keyword">let</span> message: <span class="type">string</span> = <span class="string">"Hello"</span>;\n<span class="keyword">let</span> age: <span class="type">number</span> = <span class="number">25</span>;\n<span class="keyword">let</span> active: <span class="type">boolean</span> = <span class="keyword">true</span>;\n\n<span class="comment">// Define object shapes</span>\n<span class="keyword">interface</span> <span class="type">Person</span> {\n    name: <span class="type">string</span>;\n    age: <span class="type">number</span>;\n    email?: <span class="type">string</span>;  <span class="comment">// optional</span>\n}`
            },
            'Functions': {
                file: 'functions.ts',
                code: `<span class="comment">// Typed function</span>\n<span class="keyword">function</span> <span class="function">greet</span>(name: <span class="type">string</span>): <span class="type">string</span> {\n    <span class="keyword">return</span> <span class="string">\`Hello, \${name}!\`</span>;\n}\n\n<span class="comment">// Arrow function</span>\n<span class="keyword">const</span> <span class="function">add</span> = (a: <span class="type">number</span>, b: <span class="type">number</span>): <span class="type">number</span> => {\n    <span class="keyword">return</span> a + b;\n};`
            },
            'Generics': {
                file: 'generics.ts',
                code: `<span class="comment">// Generic = works with any type</span>\n<span class="keyword">function</span> <span class="function">first</span><<span class="type">T</span>>(arr: <span class="type">T</span>[]): <span class="type">T</span> | <span class="type">undefined</span> {\n    <span class="keyword">return</span> arr[<span class="number">0</span>];\n}\n\n<span class="function">first</span>([<span class="number">1</span>, <span class="number">2</span>, <span class="number">3</span>]);      <span class="comment">// number</span>\n<span class="function">first</span>([<span class="string">"a"</span>, <span class="string">"b"</span>]);    <span class="comment">// string</span>`
            }
        }
    },
    go: {
        name: 'Go',
        icon: 'fab fa-golang',
        color: '#00ADD8',
        tagline: 'Simple, reliable, and efficient',
        year: '2009',
        popularity: 'Top 10',
        description: 'Go (Golang) was created by Google to be simple and efficient. It\'s perfect for cloud services and DevOps tools. Docker and Kubernetes are written in Go.',
        useCases: [{
                icon: 'fas fa-cloud',
                title: 'Cloud Services',
                desc: 'Docker, Kubernetes'
            },
            {
                icon: 'fas fa-server',
                title: 'Microservices',
                desc: 'Fast APIs'
            },
            {
                icon: 'fas fa-tools',
                title: 'DevOps Tools',
                desc: 'Terraform'
            },
            {
                icon: 'fas fa-network-wired',
                title: 'Networking',
                desc: 'Proxies, balancers'
            },
            {
                icon: 'fas fa-terminal',
                title: 'CLI Tools',
                desc: 'Command line apps'
            },
            {
                icon: 'fas fa-bolt',
                title: 'Concurrent',
                desc: 'Goroutines'
            }
        ],
        pros: ['Simple and easy to learn', 'Fast compilation', 'Built-in concurrency',
            'Single binary output', 'Great standard library'
        ],
        cons: ['Limited generics (improving)', 'Verbose error handling', 'Limited OOP features',
            'Smaller ecosystem'
        ],
        examples: {
            'Hello World': {
                file: 'main.go',
                code: `<span class="keyword">package</span> main\n\n<span class="keyword">import</span> <span class="string">"fmt"</span>\n\n<span class="keyword">func</span> <span class="function">main</span>() {\n    fmt.<span class="function">Println</span>(<span class="string">"Hello, World!"</span>)\n}`
            },
            'Variables': {
                file: 'variables.go',
                code: `<span class="keyword">package</span> main\n\n<span class="comment">// Explicit type</span>\n<span class="keyword">var</span> message <span class="type">string</span> = <span class="string">"Hello"</span>\n<span class="keyword">var</span> age <span class="type">int</span> = <span class="number">25</span>\n\n<span class="comment">// Short declaration (inferred)</span>\nname := <span class="string">"Alex"</span>\nprice := <span class="number">19.99</span>\n\n<span class="comment">// Slices (like arrays)</span>\nfruits := []<span class="type">string</span>{<span class="string">"apple"</span>, <span class="string">"banana"</span>}`
            },
            'Functions': {
                file: 'functions.go',
                code: `<span class="comment">// Function with return type</span>\n<span class="keyword">func</span> <span class="function">greet</span>(name <span class="type">string</span>) <span class="type">string</span> {\n    <span class="keyword">return</span> <span class="string">"Hello, "</span> + name\n}\n\n<span class="comment">// Multiple return values!</span>\n<span class="keyword">func</span> <span class="function">divide</span>(a, b <span class="type">float64</span>) (<span class="type">float64</span>, <span class="type">error</span>) {\n    <span class="keyword">if</span> b == <span class="number">0</span> {\n        <span class="keyword">return</span> <span class="number">0</span>, errors.<span class="function">New</span>(<span class="string">"no divide by zero"</span>)\n    }\n    <span class="keyword">return</span> a / b, <span class="keyword">nil</span>\n}`
            },
            'Goroutines': {
                file: 'concurrent.go',
                code: `<span class="keyword">package</span> main\n\n<span class="keyword">import</span> <span class="string">"fmt"</span>\n\n<span class="keyword">func</span> <span class="function">sayHello</span>() {\n    fmt.<span class="function">Println</span>(<span class="string">"Hello from goroutine!"</span>)\n}\n\n<span class="keyword">func</span> <span class="function">main</span>() {\n    <span class="comment">// Start concurrent goroutine</span>\n    <span class="keyword">go</span> <span class="function">sayHello</span>()\n\n    fmt.<span class="function">Println</span>(<span class="string">"Hello from main!"</span>)\n}`
            }
        }
    },
    rust: {
        name: 'Rust',
        icon: 'fas fa-gear',
        color: '#DEA584',
        tagline: 'Safe, fast, and fearless',
        year: '2010',
        popularity: 'Most Loved',
        description: 'Rust guarantees memory safety without a garbage collector. It\'s been voted the "most loved" programming language for years. Companies like Mozilla, Discord, and Cloudflare use it.',
        useCases: [{
                icon: 'fas fa-microchip',
                title: 'Systems',
                desc: 'OS, drivers'
            },
            {
                icon: 'fas fa-globe',
                title: 'WebAssembly',
                desc: 'Fast web apps'
            },
            {
                icon: 'fas fa-shield-alt',
                title: 'Security',
                desc: 'Memory-safe code'
            },
            {
                icon: 'fas fa-terminal',
                title: 'CLI Tools',
                desc: 'ripgrep, bat'
            },
            {
                icon: 'fas fa-gamepad',
                title: 'Game Engines',
                desc: 'Bevy engine'
            },
            {
                icon: 'fas fa-database',
                title: 'Databases',
                desc: 'TiKV, SurrealDB'
            }
        ],
        pros: ['Memory safety guaranteed', 'No garbage collector', 'Excellent error messages',
            'Modern tooling (cargo)', 'Growing community'
        ],
        cons: ['Steep learning curve', 'Longer compile times', 'Borrow checker is strict',
            'Smaller ecosystem'
        ],
        examples: {
            'Hello World': {
                file: 'main.rs',
                code: `<span class="keyword">fn</span> <span class="function">main</span>() {\n    <span class="function">println!</span>(<span class="string">"Hello, World!"</span>);\n}`
            },
            'Variables': {
                file: 'variables.rs',
                code: `<span class="comment">// Immutable by default!</span>\n<span class="keyword">let</span> message = <span class="string">"Hello"</span>;\n\n<span class="comment">// Use mut for mutable</span>\n<span class="keyword">let</span> <span class="keyword">mut</span> count = <span class="number">0</span>;\ncount += <span class="number">1</span>;\n\n<span class="comment">// Type annotations</span>\n<span class="keyword">let</span> age: <span class="type">i32</span> = <span class="number">25</span>;\n<span class="keyword">let</span> price: <span class="type">f64</span> = <span class="number">19.99</span>;`
            },
            'Functions': {
                file: 'functions.rs',
                code: `<span class="comment">// Function with return type</span>\n<span class="keyword">fn</span> <span class="function">greet</span>(name: &<span class="type">str</span>) -> <span class="type">String</span> {\n    <span class="function">format!</span>(<span class="string">"Hello, {}!"</span>, name)\n}\n\n<span class="comment">// Error handling with Result</span>\n<span class="keyword">fn</span> <span class="function">divide</span>(a: <span class="type">f64</span>, b: <span class="type">f64</span>) -> <span class="type">Result</span><<span class="type">f64</span>, <span class="type">String</span>> {\n    <span class="keyword">if</span> b == <span class="number">0.0</span> {\n        <span class="type">Err</span>(<span class="string">"Cannot divide by zero"</span>.<span class="function">to_string</span>())\n    } <span class="keyword">else</span> {\n        <span class="type">Ok</span>(a / b)\n    }\n}`
            },
            'Ownership': {
                file: 'ownership.rs',
                code: `<span class="comment">// Rust's unique feature: ownership</span>\n<span class="keyword">fn</span> <span class="function">main</span>() {\n    <span class="keyword">let</span> s1 = <span class="type">String</span>::<span class="function">from</span>(<span class="string">"hello"</span>);\n\n    <span class="comment">// Move: s1 is no longer valid!</span>\n    <span class="keyword">let</span> s2 = s1;\n\n    <span class="comment">// Borrow: reference without moving</span>\n    <span class="function">print_string</span>(&s2);\n}\n\n<span class="keyword">fn</span> <span class="function">print_string</span>(s: &<span class="type">String</span>) {\n    <span class="function">println!</span>(<span class="string">"{}"</span>, s);\n}`
            }
        }
    },
    ruby: {
        name: 'Ruby',
        icon: 'fas fa-gem',
        color: '#CC342D',
        tagline: 'Designed for developer happiness',
        year: '1995',
        popularity: 'Top 15',
        description: 'Ruby focuses on simplicity and productivity. It\'s famous for Ruby on Rails, which revolutionized web development. Companies like Airbnb, GitHub, and Shopify use it.',
        useCases: [{
                icon: 'fas fa-globe',
                title: 'Web Dev',
                desc: 'Ruby on Rails'
            },
            {
                icon: 'fas fa-rocket',
                title: 'Startups',
                desc: 'Rapid prototyping'
            },
            {
                icon: 'fas fa-cogs',
                title: 'Automation',
                desc: 'Scripts and tools'
            },
            {
                icon: 'fas fa-server',
                title: 'APIs',
                desc: 'Backend services'
            },
            {
                icon: 'fas fa-tools',
                title: 'DevOps',
                desc: 'Chef, Puppet'
            },
            {
                icon: 'fas fa-vial',
                title: 'Testing',
                desc: 'RSpec, Cucumber'
            }
        ],
        pros: ['Elegant and readable', 'Rails is very productive', 'Great for prototyping',
            'Strong community', 'Convention over config'
        ],
        cons: ['Slower performance', 'Less popular than before', 'Not great for mobile',
            'Higher memory usage'
        ],
        examples: {
            'Hello World': {
                file: 'hello.rb',
                code: `<span class="comment"># Ruby is elegant and simple</span>\n<span class="function">puts</span> <span class="string">"Hello, World!"</span>\n\n<span class="comment"># String interpolation</span>\nname = <span class="string">"Bagely Bytes"</span>\n<span class="function">puts</span> <span class="string">"Welcome to #{name}!"</span>`
            },
            'Variables': {
                file: 'variables.rb',
                code: `<span class="comment"># No type declarations needed</span>\nmessage = <span class="string">"Hello"</span>\nage = <span class="number">25</span>\nprice = <span class="number">19.99</span>\nis_student = <span class="keyword">true</span>\n\n<span class="comment"># Arrays</span>\nfruits = [<span class="string">"apple"</span>, <span class="string">"banana"</span>, <span class="string">"cherry"</span>]\n\n<span class="comment"># Hashes (like dictionaries)</span>\nperson = { name: <span class="string">"Alex"</span>, age: <span class="number">25</span> }`
            },
            'Loops': {
                file: 'loops.rb',
                code: `<span class="comment"># Ruby loops are elegant</span>\n<span class="number">5</span>.times <span class="keyword">do</span> |i|\n  <span class="function">puts</span> <span class="string">"Count: #{i}"</span>\n<span class="keyword">end</span>\n\n<span class="comment"># Each loop</span>\ncolors = [<span class="string">"red"</span>, <span class="string">"green"</span>, <span class="string">"blue"</span>]\ncolors.each <span class="keyword">do</span> |color|\n  <span class="function">puts</span> color\n<span class="keyword">end</span>\n\n<span class="comment"># One-liner</span>\ncolors.each { |c| <span class="function">puts</span> c }`
            },
            'Classes': {
                file: 'person.rb',
                code: `<span class="keyword">class</span> <span class="type">Person</span>\n  <span class="comment"># Auto-generate getters/setters</span>\n  <span class="function">attr_accessor</span> <span class="keyword">:name</span>, <span class="keyword">:age</span>\n\n  <span class="keyword">def</span> <span class="function">initialize</span>(name, age)\n    @name = name\n    @age = age\n  <span class="keyword">end</span>\n\n  <span class="keyword">def</span> <span class="function">greet</span>\n    <span class="string">"Hello, I'm #{@name}"</span>\n  <span class="keyword">end</span>\n<span class="keyword">end</span>\n\nperson = <span class="type">Person</span>.<span class="keyword">new</span>(<span class="string">"Alex"</span>, <span class="number">25</span>)`
            }
        }
    }
};

// DOM Elements
const langCards = document.querySelectorAll('.lang-card');
const detailPanel = document.getElementById('langDetailPanel');
const panelContent = document.getElementById('panelContent');
const closePanel = document.getElementById('closePanel');

// Language Card Event Listeners
langCards.forEach(card => {
    card.addEventListener('click', () => {
        const lang = card.dataset.lang;
        showLanguageDetail(lang);
        langCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
    });
});

closePanel.addEventListener('click', () => {
    detailPanel.classList.remove('show');
    langCards.forEach(c => c.classList.remove('active'));
});

// Show Language Detail Function
function showLanguageDetail(langKey) {
    const lang = languageData[langKey];
    if (!lang) return;

    const useCasesHTML = lang.useCases.map(uc => `
        <div class="use-case-card">
            <i class="${uc.icon}"></i>
            <h4>${uc.title}</h4>
            <p>${uc.desc}</p>
        </div>
    `).join('');

    const prosHTML = lang.pros.map(p => `<li>${p}</li>`).join('');
    const consHTML = lang.cons.map(c => `<li>${c}</li>`).join('');

    const exampleKeys = Object.keys(lang.examples);
    const tabsHTML = exampleKeys.map((key, i) => `
        <button class="code-tab ${i === 0 ? 'active' : ''}" data-example="${key}">${key}</button>
    `).join('');

    const firstExample = lang.examples[exampleKeys[0]];

    panelContent.innerHTML = `
        <div class="detail-header">
            <div class="detail-icon" style="color: ${lang.color}">
                <i class="${lang.icon}"></i>
            </div>
            <div class="detail-info">
                <h2>${lang.name}</h2>
                <p class="tagline">${lang.tagline}</p>
                <div class="detail-meta">
                    <div class="meta-item">
                        <span class="value">${lang.year}</span>
                        <span class="label">Created</span>
                    </div>
                    <div class="meta-item">
                        <span class="value">${lang.popularity}</span>
                        <span class="label">Popularity</span>
                    </div>
                </div>
            </div>
        </div>

        <p style="color: var(--text-medium); margin-bottom: 30px; font-size: 1.05rem; line-height: 1.8;">
            ${lang.description}
        </p>

        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-bullseye" style="color: var(--orange-primary);"></i> What It's Used For
        </h3>
        <div class="use-cases-grid">${useCasesHTML}</div>

        <div class="pros-cons-grid">
            <div class="pros-card">
                <h4><i class="fas fa-check-circle"></i> Pros</h4>
                <ul>${prosHTML}</ul>
            </div>
            <div class="cons-card">
                <h4><i class="fas fa-times-circle"></i> Cons</h4>
                <ul>${consHTML}</ul>
            </div>
        </div>

        <div class="code-examples">
            <h3><i class="fas fa-code"></i> Code Examples</h3>
            <div class="code-tabs" id="codeTabs">${tabsHTML}</div>
            <div class="code-block">
                <div class="code-block-header">
                    <span class="code-filename" id="codeFilename">${firstExample.file}</span>
                    <button class="copy-btn" onclick="copyCode()"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <div class="code-body" id="codeBody">${firstExample.code}</div>
            </div>
        </div>
    `;

    // Tab switching
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.example;
            const example = lang.examples[key];
            document.getElementById('codeFilename').textContent = example.file;
            document.getElementById('codeBody').innerHTML = example.code;
            document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    detailPanel.classList.add('show');
    detailPanel.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    window.currentLang = langKey;
}

// Copy Code Function
function copyCode() {
    const code = document.getElementById('codeBody').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('bagely-theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Add rotation animation to button
    themeToggle.style.transform = 'scale(1.1) rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 400);

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('bagely-theme', newTheme);
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements that should animate on scroll
document.querySelectorAll('.section-header, .lang-card, .tip-card, .goal-card, .path-step').forEach(el => {
    el.style.animationPlayState = 'paused';
    animateOnScroll.observe(el);
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Skip the about link - it has its own handler
        if (this.id === 'aboutLink') return;

        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// About Modal
const aboutLink = document.getElementById('aboutLink');
const aboutModal = document.getElementById('aboutModal');
const modalClose = document.getElementById('modalClose');

aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.classList.add('show');
    document.body.style.overflow = 'hidden';
});

modalClose.addEventListener('click', () => {
    aboutModal.classList.remove('show');
    document.body.style.overflow = '';
});

// Close modal when clicking outside
aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
        aboutModal.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal.classList.contains('show')) {
        aboutModal.classList.remove('show');
        document.body.style.overflow = '';
    }
});
