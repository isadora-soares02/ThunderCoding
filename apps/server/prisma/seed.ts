import { prisma } from "../src/lib/prisma";

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type LessonType = "TEXT" | "VIDEO" | "ASSIGNMENT" | "QUIZ";
type AnswerKey = "A" | "B" | "C" | "D";

type QuestionSeed = {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correct: AnswerKey;
    explanation: string;
    xp?: number;
    difficulty?: Difficulty;
};

type TaskSeed = {
    id: string;
    title: string;
    description: string;
    objective: string;
    xp?: number;
    estimatedTime?: string;
    requirements: string[];
};

type LessonSeed = {
    id: string;
    title: string;
    type: LessonType;
    order: number;
    xp: number;
    durationMin: number;
    content?: string;
    videoUrl?: string;
    questionId?: string;
    taskId?: string;
};

type CourseSeed = {
    id: string;
    title: string;
    description: string;
    language: string;
    level: Difficulty;
    instructor: string;
    banner: string;
    color: string;
    questions: QuestionSeed[];
    tasks: TaskSeed[];
    lessons: LessonSeed[];
};

const emailToReset = "luizfalmeidamorais@gmail.com";

function esc(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function richContent(args: {
    title: string;
    intro: string[];
    bullets?: string[];
    numbered?: string[];
    image?: string;
    imageAlt?: string;
    callout?: string;
    code?: string;
}) {
    const intro = args.intro
        .map((p) => `<p class="my-2 leading-7">${p}</p>`)
        .join("\n");
    const bullets = args.bullets?.length
        ? `<h3 class="mt-5">Pontos principais</h3><ul class="my-2">${args.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
        : "";
    const numbered = args.numbered?.length
        ? `<h3 class="mt-5">Passo a passo</h3><ol class="my-2">${args.numbered.map((b) => `<li>${b}</li>`).join("")}</ol>`
        : "";
    const image = args.image
        ? `<figure class="my-4 flex justify-center"><img src="${args.image}" alt="${args.imageAlt ?? args.title}" class="rounded-xl shadow-sm border object-contain w-full max-w-[260px] sm:max-w-[300px] max-h-48 bg-white p-3" /></figure>`
        : "";
    const callout = args.callout
        ? `<div class="my-4 rounded-xl border p-4 bg-muted/40"><strong>Para levar para a prática:</strong><br>${args.callout.includes("é uma etapa importante") ? `Ao final de ${args.title}, tente explicar qual problema esse conceito resolve, onde ele aparece em projetos reais e qual cuidado evita erro em produção.` : args.callout}</div>`
        : "";
    const code = args.code
        ? `<pre class="my-4"><code>${esc(args.code)}</code></pre>`
        : "";
    return `<article class="prose prose-slate max-w-none space-y-2"><h2>${args.title}</h2>${image}${intro}${bullets}${numbered}${code}${callout}</article>`;
}

function videoContent(title: string, description: string, goals: string[]) {
    return richContent({
        title,
        intro: [
            description,
            "Use esta aula como revisão visual: pause nos exemplos, compare com o texto e transforme as anotações em pequenos testes práticos.",
        ],
        bullets: goals,
        callout:
            "Depois do vídeo, registre um exemplo próprio. Aprender vendo ajuda; aprender refazendo consolida.",
    });
}

function quizContent(topic: string) {
    return `<p class="leading-7">Responda a esta pergunta de verificação sobre <strong>${topic.replace("Quiz: ", "")}</strong>. A ideia não é decorar: leia as alternativas pensando no cenário prático apresentado nas aulas anteriores.</p>`;
}

function taskContent(topic: string) {
    return `<p class="leading-7">Nesta atividade de <strong>${topic.replace("Atividade: ", "")}</strong>, implemente aos poucos, teste cada etapa e escreva no README quais decisões tomou e quais erros encontrou durante a prática.</p>`;
}

function totalXp(lessons: LessonSeed[]) {
    return lessons.reduce((sum, lesson) => sum + lesson.xp, 0);
}

function totalMinutes(lessons: LessonSeed[]) {
    return lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0);
}

function durationLabel(minutes: number) {
    const hours = Math.ceil(minutes / 60);
    return `${hours}h`;
}

async function createFullCourse(spec: CourseSeed) {
    if (spec.lessons.length < 15) {
        throw new Error(
            `Curso ${spec.id} precisa ter pelo menos 15 aulas. Atual: ${spec.lessons.length}`
        );
    }

    const course = await prisma.course.create({
        data: {
            id: spec.id,
            title: spec.title,
            description: spec.description,
            language: spec.language,
            level: spec.level,
            duration: durationLabel(totalMinutes(spec.lessons)),
            xp: totalXp(spec.lessons),
            instructor: spec.instructor,
            banner: spec.banner,
            color: spec.color,
            status: "PUBLISHED",
        },
    });

    for (const q of spec.questions) {
        await prisma.question.create({
            data: {
                id: q.id,
                courseId: course.id,
                question: q.question,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correct: q.correct,
                explanation: q.explanation,
                xp: q.xp ?? 40,
                difficulty: q.difficulty ?? spec.level,
            },
        });
    }

    for (const t of spec.tasks) {
        await prisma.task.create({
            data: {
                id: t.id,
                courseId: course.id,
                title: t.title,
                description: t.description,
                objective: t.objective,
                xp: t.xp ?? 180,
                estimatedTime: t.estimatedTime ?? "60 min",
                requirements: t.requirements,
            },
        });
    }

    await prisma.lesson.createMany({
        data: spec.lessons.map((lesson) => ({
            id: lesson.id,
            courseId: course.id,
            title: lesson.title,
            type: lesson.type,
            content:
                lesson.content ??
                (lesson.type === "QUIZ"
                    ? quizContent(lesson.title)
                    : taskContent(lesson.title)),
            videoUrl: lesson.videoUrl,
            questionId: lesson.questionId,
            taskId: lesson.taskId,
            order: lesson.order,
            xp: lesson.xp,
            durationMin: lesson.durationMin,
        })),
    });

    return {
        id: course.id,
        xp: totalXp(spec.lessons),
        minutes: totalMinutes(spec.lessons),
    };
}

async function createTrail(args: {
    id: string;
    name: string;
    description: string;
    level: Difficulty;
    color: string;
    icon: string;
    courses: { courseId: string; order: number; xp: number }[];
}) {
    return prisma.trail.create({
        data: {
            id: args.id,
            name: args.name,
            description: args.description,
            level: args.level,
            totalXp: args.courses.reduce((sum, item) => sum + item.xp, 0),
            progress: 0,
            status: "PUBLISHED",
            color: args.color,
            icon: args.icon,
            courses: {
                create: args.courses.map(({ courseId, order }) => ({
                    courseId,
                    order,
                })),
            },
        },
    });
}

function svgCard(label: string, accent: string) {
    const safeLabel = encodeURIComponent(label);
    const safeAccent = encodeURIComponent(accent);
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='520' height='320' viewBox='0 0 520 320'><rect width='520' height='320' rx='32' fill='%23f8fafc'/><rect x='28' y='28' width='464' height='264' rx='28' fill='white' stroke='%23e2e8f0' stroke-width='4'/><circle cx='128' cy='150' r='46' fill='${safeAccent}' opacity='0.18'/><circle cx='260' cy='92' r='34' fill='${safeAccent}' opacity='0.25'/><circle cx='388' cy='168' r='52' fill='${safeAccent}' opacity='0.14'/><path d='M128 150 L260 92 L388 168 M128 150 L388 168' stroke='${safeAccent}' stroke-width='8' stroke-linecap='round' opacity='0.65'/><text x='260' y='246' font-family='Inter,Arial,sans-serif' font-size='34' font-weight='700' fill='%230f172a' text-anchor='middle'>${safeLabel}</text></svg>`;
}

const edImg = svgCard("Estruturas de Dados", "%232563eb");
const treeImg = svgCard("Árvores e Grafos", "%2316a34a");
const webImg = svgCard("Desenvolvimento Web", "%23ea580c");
const jsImg = svgCard("JavaScript", "%23ca8a04");
const linuxImg = svgCard("Linux e Shell", "%230f172a");
const cImg = svgCard("Linguagem C", "%230891b2");
const osImg = svgCard("Sistemas Operacionais", "%237c3aed");
const reactImg = svgCard("Front-end", "%230ea5e9");
const nodeImg = svgCard("Back-end e APIs", "%2316a34a");

const edFundamentosSpec: CourseSeed = {
    id: "ed-c1",
    title: "Estrutura de Dados: Fundamentos Avançados",
    description:
        "Curso completo de fundamentos: TAD, listas estáticas e dinâmicas, listas circulares, pilhas, filas e práticas em C.",
    language: "C",
    level: "BEGINNER",
    instructor:
        "Prof. Luciano Freire, Profa. Tiemi C. Sakata & Prof. Marco Montebello",
    banner: "from-primary to-secondary",
    color: "primary",
    questions: [
        {
            id: "ed-q1",
            question:
                "Qual é a principal característica de um Tipo Abstrato de Dados (TAD)?",
            optionA: "Expor todos os detalhes internos",
            optionB: "Separar conceito e implementação",
            optionC: "Ser usado apenas com int",
            optionD: "Eliminar operações",
            correct: "B",
            explanation:
                "TAD descreve dados e operações, escondendo detalhes internos.",
            xp: 40,
        },
        {
            id: "ed-q2",
            question: "Em uma lista dinâmica encadeada, cada nó normalmente possui:",
            optionA: "Apenas um índice",
            optionB: "Dado e ponteiro para o próximo nó",
            optionC: "Dois vetores fixos",
            optionD: "Um arquivo em disco",
            correct: "B",
            explanation:
                "A lista dinâmica encadeada usa nós alocados dinamicamente com dado e referência para o próximo.",
            xp: 40,
        },
        {
            id: "ed-q3",
            question: "Qual regra descreve uma pilha?",
            optionA: "FIFO",
            optionB: "LIFO",
            optionC: "Ordem alfabética",
            optionD: "Ordem aleatória",
            correct: "B",
            explanation: "Pilha segue LIFO: o último que entra é o primeiro que sai.",
            xp: 40,
        },
        {
            id: "ed-q4",
            question: "Qual regra descreve uma fila?",
            optionA: "LIFO",
            optionB: "FIFO",
            optionC: "Menor valor primeiro",
            optionD: "Maior valor primeiro",
            correct: "B",
            explanation:
                "Fila segue FIFO: o primeiro que entra é o primeiro que sai.",
            xp: 40,
        },
        {
            id: "ed-q5",
            question:
                "Qual estrutura favorece inserção e remoção em posições controladas por ponteiros?",
            optionA: "Lista dinâmica",
            optionB: "Vetor fixo somente leitura",
            optionC: "Constante literal",
            optionD: "Arquivo texto",
            correct: "A",
            explanation:
                "Listas dinâmicas facilitam manipulação por ponteiros e alocação sob demanda.",
            xp: 40,
        },
        {
            id: "ed-q6",
            question: "Em lista circular, o último nó aponta para:",
            optionA: "NULL sempre",
            optionB: "O início da lista",
            optionC: "Ele mesmo obrigatoriamente",
            optionD: "Um arquivo externo",
            correct: "B",
            explanation:
                "Na lista circular, o último elemento aponta novamente para o início.",
            xp: 40,
        },
    ],
    tasks: [
        {
            id: "ed-tk1",
            title: "Implementando um TAD Ponto em C",
            description:
                "Crie um Tipo Abstrato de Dados para representar um ponto bidimensional.",
            objective: "Praticar separação entre interface e implementação em C.",
            xp: 200,
            estimatedTime: "80 min",
            requirements: [
                "Criar ponto.h e ponto.c",
                "Criar struct Ponto",
                "Implementar criar, liberar, acessar e atribuir",
                "Calcular distância entre dois pontos",
                "Testar no main.c",
            ],
        },
        {
            id: "ed-tk2",
            title: "Lista estática completa",
            description: "Implemente operações essenciais de uma lista estática.",
            objective: "Entender controle de capacidade, inserção, remoção e busca.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Usar vetor interno",
                "Controlar quantidade atual",
                "Implementar inserir fim e posição",
                "Implementar remover por posição",
                "Implementar busca e impressão",
            ],
        },
        {
            id: "ed-tk3",
            title: "Lista dinâmica encadeada",
            description:
                "Implemente uma lista simplesmente encadeada com alocação dinâmica.",
            objective: "Praticar malloc, free e manipulação de ponteiros.",
            xp: 240,
            estimatedTime: "100 min",
            requirements: [
                "Criar struct No",
                "Inserir no início e no fim",
                "Remover valor específico",
                "Buscar elemento",
                "Liberar toda a lista",
            ],
        },
        {
            id: "ed-tk4",
            title: "Pilha e fila em C",
            description:
                "Implemente uma pilha e uma fila e compare seus comportamentos.",
            objective: "Fixar LIFO e FIFO com testes práticos.",
            xp: 240,
            estimatedTime: "100 min",
            requirements: [
                "Criar pilha estática",
                "Criar fila circular estática",
                "Inserir valores de teste",
                "Remover e registrar ordem de saída",
                "Explicar diferença no README",
            ],
        },
    ],
    lessons: [
        {
            id: "ed-l1",
            title: "Introdução às Estruturas de Dados",
            type: "TEXT",
            content: richContent({
                title: "Por que estudar Estruturas de Dados?",
                intro: [
                    "Estruturas de dados são formas de organizar informações para que programas consigam armazenar, acessar, alterar e processar dados com clareza e eficiência.",
                    "Nos slides de TAD, a disciplina começa mostrando que conhecer apenas uma linguagem não basta: é necessário entender as características dos dados e escolher boas formas de representá-los.",
                    "Ao longo do curso, você verá estruturas lineares como listas, pilhas e filas, sempre relacionando conceito, operações e implementação em C.",
                ],
                bullets: [
                    "Diferença entre dado, tipo de dado, estrutura e algoritmo",
                    "Relação entre organização dos dados e desempenho",
                    "Importância de separar problema, representação e código",
                ],
                image: edImg,
                callout:
                    "Uma estrutura de dados bem escolhida reduz complexidade, evita retrabalho e torna o programa mais fácil de manter.",
            }),
            order: 1,
            xp: 80,
            durationMin: 25,
        },
        {
            id: "ed-l2",
            title: "Algoritmos, programas e tipos de dados",
            type: "TEXT",
            content: richContent({
                title: "Algoritmos, programas e tipos de dados",
                intro: [
                    "Um algoritmo é uma sequência de ações para resolver um problema. Um programa é a formulação concreta desse algoritmo em uma linguagem executável.",
                    "Tipos de dados definem quais valores podem ser manipulados. Em C, tipos simples incluem int, float, double e char; tipos estruturados podem ser criados com struct.",
                    "Estruturas de dados entram quando os tipos básicos não são suficientes para representar a realidade do problema.",
                ],
                bullets: [
                    "Algoritmo: solução abstrata",
                    "Programa: implementação executável",
                    "Tipo simples: valor isolado",
                    "Tipo estruturado: conjunto organizado de campos",
                ],
                code: `typedef struct {
  int ra;
  char nome[80];
  float media;
} Aluno;`,
            }),
            order: 2,
            xp: 80,
            durationMin: 25,
        },
        {
            id: "ed-l3",
            title: "Tipo Abstrato de Dados — TAD",
            type: "TEXT",
            content: richContent({
                title: "Tipo Abstrato de Dados — TAD",
                intro: [
                    "Um TAD é uma coleção bem definida de dados com um conjunto de operações aplicáveis sobre esses dados.",
                    "A característica mais importante é a separação entre conceito e implementação: quem usa o TAD precisa conhecer as operações disponíveis, mas não os detalhes internos.",
                    "Esse princípio melhora manutenção, reutilização e segurança, pois evita que outras partes do programa manipulem diretamente a representação interna.",
                ],
                bullets: [
                    "Define o que a estrutura faz",
                    "Oculta como a estrutura é implementada",
                    "Permite trocar implementação sem alterar quem usa",
                    "Organiza código em interface e implementação",
                ],
                code: `// ponto.h
typedef struct ponto Ponto;
Ponto* ponto_criar(float x, float y);
void ponto_liberar(Ponto* p);`,
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l4",
            title: "Quiz: Conceitos de TAD",
            type: "QUIZ",
            questionId: "ed-q1",
            order: 4,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed-l5",
            title: "Atividade: Implementando um TAD",
            type: "ASSIGNMENT",
            taskId: "ed-tk1",
            order: 5,
            xp: 200,
            durationMin: 80,
        },
        {
            id: "ed-l6",
            title: "Listas: visão geral",
            type: "TEXT",
            content: richContent({
                title: "Listas: visão geral",
                intro: [
                    "Listas são estruturas lineares que armazenam elementos em sequência lógica. Essa sequência pode ser representada por vetor, no caso da lista estática, ou por nós encadeados, no caso da lista dinâmica.",
                    "Nos slides de listas, o foco é entender criação, destruição, inserção, remoção, busca, lista vazia e lista cheia.",
                    "A escolha entre lista estática e dinâmica depende da previsibilidade do tamanho, uso de memória e custo das operações.",
                ],
                bullets: [
                    "Lista estática usa memória contígua",
                    "Lista dinâmica usa alocação conforme necessidade",
                    "Inserções e remoções podem exigir deslocamentos ou ajuste de ponteiros",
                    "A interface do TAD pode esconder essas diferenças",
                ],
                image: edImg,
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l7",
            title: "Lista estática em C",
            type: "TEXT",
            content: richContent({
                title: "Lista estática em C",
                intro: [
                    "Na lista estática, os elementos são armazenados em um vetor com capacidade máxima definida. O programa também controla quantos elementos estão efetivamente ocupados.",
                    "Essa implementação é simples e rápida para acesso por índice, mas tem limitação de capacidade e pode exigir deslocamento de elementos em inserções ou remoções no meio.",
                    "É uma boa primeira implementação para compreender as operações do TAD Lista.",
                ],
                bullets: [
                    "Capacidade fixa",
                    "Controle de tamanho atual",
                    "Inserção pode exigir deslocamento",
                    "Remoção pode compactar o vetor",
                ],
                code: `#define MAX 100
typedef struct {
  int dados[MAX];
  int qtd;
} Lista;`,
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l8",
            title: "Atividade: Lista estática completa",
            type: "ASSIGNMENT",
            taskId: "ed-tk2",
            order: 8,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "ed-l9",
            title: "Lista dinâmica encadeada",
            type: "TEXT",
            content: richContent({
                title: "Lista dinâmica encadeada",
                intro: [
                    "A lista dinâmica encadeada é definida por nós alocados dinamicamente. Cada nó possui o dado e um ponteiro para o próximo elemento.",
                    "Diferente da lista estática, ela cresce conforme a necessidade, mas exige cuidado com ponteiros, malloc e free.",
                    "O último nó normalmente aponta para NULL, indicando o fim da lista.",
                ],
                bullets: [
                    "Alocação sob demanda",
                    "Cada nó aponta para o próximo",
                    "Não exige deslocamento físico de elementos",
                    "Requer liberação correta da memória",
                ],
                code: `typedef struct no {
  int valor;
  struct no* prox;
} No;`,
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l10",
            title: "Quiz: Lista dinâmica",
            type: "QUIZ",
            questionId: "ed-q2",
            order: 10,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed-l11",
            title: "Listas circular e duplamente encadeada",
            type: "TEXT",
            content: richContent({
                title: "Listas circular e duplamente encadeada",
                intro: [
                    "Na lista circular, o último elemento aponta novamente para o início, fazendo a lista parecer não ter fim.",
                    "Na lista duplamente encadeada, cada nó possui ponteiro para o próximo e para o anterior, permitindo navegação nos dois sentidos.",
                    "Essas variações são úteis em cenários como playlists, escalonamento circular e navegação bidirecional.",
                ],
                bullets: [
                    "Circular: último aponta para o primeiro",
                    "Duplamente encadeada: ponteiros anterior e próximo",
                    "Mais flexibilidade, maior cuidado com ponteiros",
                    "Boa para percorrer nos dois sentidos",
                ],
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l12",
            title: "Atividade: Lista dinâmica",
            type: "ASSIGNMENT",
            taskId: "ed-tk3",
            order: 12,
            xp: 240,
            durationMin: 100,
        },
        {
            id: "ed-l13",
            title: "Pilhas: LIFO na prática",
            type: "TEXT",
            content: richContent({
                title: "Pilhas: LIFO na prática",
                intro: [
                    "Pilha é uma estrutura linear em que a inserção e a remoção ocorrem no topo.",
                    "Ela segue a regra LIFO: Last In, First Out. Isso significa que o último elemento inserido será o primeiro a sair.",
                    "Pilhas aparecem em chamadas de função, desfazer/refazer, validação de expressões e navegação de histórico.",
                ],
                bullets: [
                    "push: inserir no topo",
                    "pop: remover do topo",
                    "top: consultar topo",
                    "empty/full: verificar estado",
                ],
                code: `push(10);
push(20);
pop(); // remove 20`,
            }),
            order: 13,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l14",
            title: "Quiz: Pilhas",
            type: "QUIZ",
            questionId: "ed-q3",
            order: 14,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed-l15",
            title: "Filas: FIFO na prática",
            type: "TEXT",
            content: richContent({
                title: "Filas: FIFO na prática",
                intro: [
                    "Fila é uma estrutura linear em que a inserção ocorre no final e a remoção ocorre no início.",
                    "Ela segue a regra FIFO: First In, First Out. O primeiro elemento que entra é o primeiro a sair.",
                    "Filas são usadas em atendimento, buffers, impressão, escalonamento e comunicação entre processos.",
                ],
                bullets: [
                    "enqueue: inserir no fim",
                    "dequeue: remover do início",
                    "front: consultar início",
                    "Fila circular evita desperdício de posições em vetor",
                ],
                code: `enqueue(10);
enqueue(40);
dequeue(); // remove 10`,
            }),
            order: 15,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed-l16",
            title: "Vídeo: Listas em C",
            type: "VIDEO",
            content: videoContent(
                "Vídeo: Listas em C",
                "Vídeo de apoio para reforçar implementação e raciocínio prático em C.",
                [
                    "Observe a estrutura dos dados",
                    "Anote as operações principais",
                    "Reproduza os exemplos no seu compilador",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=Vt6q45M_53k",
            order: 16,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "ed-l17",
            title: "Vídeo: Pilhas e Filas",
            type: "VIDEO",
            content: videoContent(
                "Vídeo: Pilhas e Filas",
                "Vídeo de apoio para reforçar implementação e raciocínio prático em C.",
                [
                    "Observe a estrutura dos dados",
                    "Anote as operações principais",
                    "Reproduza os exemplos no seu compilador",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=y93DzmBskGQ",
            order: 17,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "ed-l18",
            title: "Quiz: Filas",
            type: "QUIZ",
            questionId: "ed-q4",
            order: 18,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed-l19",
            title: "Atividade: Pilha e fila",
            type: "ASSIGNMENT",
            taskId: "ed-tk4",
            order: 19,
            xp: 240,
            durationMin: 100,
        },
    ],
};

const edIntermediarioSpec: CourseSeed = {
    id: "ed-c2",
    title: "Estrutura de Dados: Árvores e Problemas Práticos",
    description:
        "Curso intermediário com Mini-PBL, listas aplicadas, memória virtual, árvores, árvores binárias e ABB.",
    language: "C",
    level: "INTERMEDIATE",
    instructor:
        "Prof. Luciano Freire, Profa. Tiemi C. Sakata & Prof. Marco Montebello",
    banner: "from-secondary to-primary",
    color: "secondary",
    questions: [
        {
            id: "ed2-q1",
            question:
                "Qual estrutura facilita inverter a ordem de caracteres para verificar palíndromos?",
            optionA: "Fila",
            optionB: "Pilha",
            optionC: "Grafo",
            optionD: "Heap",
            correct: "B",
            explanation: "A pilha inverte naturalmente a ordem por usar LIFO.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "ed2-q2",
            question: "Uma árvore é uma estrutura que:",
            optionA: "Possui ciclos obrigatórios",
            optionB: "Não possui ciclos",
            optionC: "Não possui raiz",
            optionD: "Sempre tem grau 10",
            correct: "B",
            explanation: "Árvores são estruturas hierárquicas sem ciclos.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "ed2-q3",
            question: "Em uma ABB, valores menores que a raiz ficam:",
            optionA: "À esquerda",
            optionB: "À direita",
            optionC: "Em qualquer lugar",
            optionD: "Fora da árvore",
            correct: "A",
            explanation:
                "A regra da ABB posiciona menores à esquerda e maiores à direita.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "ed2-q4",
            question: "Qual percurso retorna valores ordenados em uma ABB?",
            optionA: "Pré-ordem",
            optionB: "Em-ordem",
            optionC: "Pós-ordem",
            optionD: "Aleatório",
            correct: "B",
            explanation: "Em-ordem visita esquerda, raiz e direita.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "ed2-q5",
            question: "O algoritmo LRU remove a página:",
            optionA: "Mais recente",
            optionB: "Menos recentemente usada",
            optionC: "Com maior id",
            optionD: "Sempre a primeira inserida",
            correct: "B",
            explanation: "LRU significa Least Recently Used.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "ed2-q6",
            question: "Nó folha é aquele que:",
            optionA: "Não tem filhos",
            optionB: "Não tem pai",
            optionC: "Tem dois filhos",
            optionD: "É sempre raiz",
            correct: "A",
            explanation: "Folha é nó terminal, sem filhos.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "ed2-tk1",
            title: "Palíndromo com pilha e fila",
            description: "Implemente duas estratégias para verificar palíndromos.",
            objective: "Comparar abordagem com pilha e com fila.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Usar pilha para inverter",
                "Usar fila para ordem original",
                "Comparar caractere a caractere",
                "Ignorar espaços opcionalmente",
                "Criar testes",
            ],
        },
        {
            id: "ed2-tk2",
            title: "LRU com lista encadeada",
            description: "Simule substituição de páginas por LRU.",
            objective: "Praticar busca, remoção e inserção em lista dinâmica.",
            xp: 260,
            estimatedTime: "110 min",
            requirements: [
                "Struct Pagina",
                "Menor timestamp",
                "Remover nó",
                "free no removido",
                "Inserir novo no início",
            ],
        },
        {
            id: "ed2-tk3",
            title: "ABB completa",
            description:
                "Implemente árvore binária de busca com operações essenciais.",
            objective: "Criar ABB com inserção, busca, remoção simples e percursos.",
            xp: 300,
            estimatedTime: "130 min",
            requirements: [
                "Inserir valores",
                "Buscar valor",
                "Em-ordem",
                "Pré-ordem",
                "Pós-ordem",
                "Calcular altura",
            ],
        },
        {
            id: "ed2-tk4",
            title: "Análise de desempenho em ABB",
            description: "Compare uma ABB balanceada e uma ABB degenerada.",
            objective: "Entender impacto do balanceamento na busca.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Criar dois conjuntos de entrada",
                "Medir número de comparações",
                "Comparar altura",
                "Explicar resultados",
            ],
        },
    ],
    lessons: [
        {
            id: "ed2-l1",
            title: "Revisão aplicada: listas, pilhas e filas",
            type: "TEXT",
            content: richContent({
                title: "Revisão aplicada: listas, pilhas e filas",
                intro: [
                    "Antes de entrar em árvores, é importante consolidar estruturas lineares. Listas dão flexibilidade de armazenamento, pilhas resolvem problemas de inversão e filas modelam ordem de chegada.",
                    "Os slides de revisão apresentam problemas no formato Mini-PBL, incentivando a escolha da estrutura mais adequada para o cenário.",
                ],
                bullets: [
                    "Identificar problema antes de escolher estrutura",
                    "Comparar custo e simplicidade",
                    "Justificar escolha técnica",
                    "Testar cenários extremos",
                ],
                image: edImg,
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l2",
            title: "Mini-PBL: verificador de palíndromos",
            type: "TEXT",
            content: richContent({
                title: "Mini-PBL: verificador de palíndromos",
                intro: [
                    "O problema pede verificar se uma palavra é igual quando lida de trás para frente, sem usar funções prontas como strrev.",
                    "A pilha é uma solução natural porque inverte a ordem dos caracteres. Ao empilhar cada caractere e desempilhar em seguida, obtemos a palavra ao contrário.",
                    "Também é possível combinar fila e pilha para comparar a ordem original com a ordem invertida.",
                ],
                bullets: [
                    "RADAR, ANA e OSSO são exemplos clássicos",
                    "Pilha resolve inversão com LIFO",
                    "Fila preserva ordem de chegada com FIFO",
                    "O exercício reforça operações, não funções prontas",
                ],
                code: `para cada caractere c:
  push(pilha, c)
para i de 0 até n-1:
  se palavra[i] != pop(pilha): não é palíndromo`,
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l3",
            title: "Quiz: palíndromos",
            type: "QUIZ",
            questionId: "ed2-q1",
            order: 3,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed2-l4",
            title: "Atividade: palíndromo com pilha e fila",
            type: "ASSIGNMENT",
            taskId: "ed2-tk1",
            order: 4,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "ed2-l5",
            title: "Mini-PBL: LRU e memória virtual",
            type: "TEXT",
            content: richContent({
                title: "Mini-PBL: LRU e memória virtual",
                intro: [
                    "O problema do gerenciador de páginas representa a memória RAM como uma lista encadeada. Cada nó contém id, timestamp de acesso e ponteiro para o próximo.",
                    "Quando a memória está cheia, o algoritmo LRU remove a página menos recentemente usada, isto é, aquela com menor timestamp.",
                    "Esse exercício é importante porque conecta estruturas de dados com um conceito real de sistemas operacionais.",
                ],
                bullets: [
                    "Percorrer lista procurando menor timestamp",
                    "Remover nó mantendo encadeamento",
                    "Liberar memória com free",
                    "Inserir nova página no início",
                ],
                code: `typedef struct pagina {
  int id;
  int timestamp;
  struct pagina* prox;
} Pagina;`,
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l6",
            title: "Quiz: LRU",
            type: "QUIZ",
            questionId: "ed2-q5",
            order: 6,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed2-l7",
            title: "Atividade: LRU com lista encadeada",
            type: "ASSIGNMENT",
            taskId: "ed2-tk2",
            order: 7,
            xp: 260,
            durationMin: 110,
        },
        {
            id: "ed2-l8",
            title: "Introdução às árvores",
            type: "TEXT",
            content: richContent({
                title: "Introdução às árvores",
                intro: [
                    "Árvore é uma estrutura não linear formada por nós e arestas. Diferente de listas, árvores representam hierarquia.",
                    "Uma árvore não possui ciclos e possui uma raiz, de onde partem os caminhos até os demais nós.",
                    "Nos slides de árvores, aparecem conceitos como raiz, pai, filho, folha, nó interno e caminho.",
                ],
                bullets: [
                    "Raiz é o nó mais alto",
                    "Folha não possui filhos",
                    "Nó interno possui pelo menos um filho",
                    "Existe caminho único da raiz até cada nó",
                ],
                image: treeImg,
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l9",
            title: "Quiz: árvores",
            type: "QUIZ",
            questionId: "ed2-q2",
            order: 9,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed2-l10",
            title: "Terminologia de árvores",
            type: "TEXT",
            content: richContent({
                title: "Terminologia de árvores",
                intro: [
                    "Dominar a terminologia é essencial antes de implementar árvores. Altura, nível, grau e caminho aparecem em muitos algoritmos.",
                    "A altura influencia o desempenho: árvores mais baixas tendem a permitir buscas mais eficientes.",
                    "O grau indica a quantidade de filhos de um nó. Em árvores binárias, o grau máximo é 2.",
                ],
                bullets: [
                    "Altura: maior caminho até uma folha",
                    "Nível: distância em relação à raiz",
                    "Grau: quantidade de filhos",
                    "Subárvore: árvore dentro de uma árvore",
                ],
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l11",
            title: "Árvores binárias",
            type: "TEXT",
            content: richContent({
                title: "Árvores binárias",
                intro: [
                    "Uma árvore binária limita cada nó a no máximo dois filhos: esquerdo e direito.",
                    "Essa restrição simplifica implementação recursiva e serve de base para árvores binárias de busca.",
                    "Árvores binárias aparecem em expressões, decisões, codificação, busca e organização hierárquica.",
                ],
                bullets: [
                    "No máximo dois filhos",
                    "Implementação naturalmente recursiva",
                    "Base para ABB e AVL",
                    "Pode ficar desbalanceada",
                ],
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l12",
            title: "Árvore Binária de Busca — ABB",
            type: "TEXT",
            content: richContent({
                title: "Árvore Binária de Busca — ABB",
                intro: [
                    "A ABB organiza dados por uma regra simples: valores menores ficam à esquerda, valores maiores ficam à direita.",
                    "Essa organização permite buscar descartando metade lógica da árvore a cada comparação quando a árvore está bem distribuída.",
                    "Porém, se os dados forem inseridos em ordem crescente, a árvore pode degenerar e se aproximar de uma lista.",
                ],
                bullets: [
                    "Busca depende da altura",
                    "Inserção segue comparações",
                    "Percurso em-ordem gera saída ordenada",
                    "Balanceamento influencia desempenho",
                ],
                code: `if (valor < raiz->valor) inserir(raiz->esq, valor);
else inserir(raiz->dir, valor);`,
            }),
            order: 12,
            xp: 100,
            durationMin: 35,
        },
        {
            id: "ed2-l13",
            title: "Quiz: ABB",
            type: "QUIZ",
            questionId: "ed2-q3",
            order: 13,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed2-l14",
            title: "Percursos em árvores",
            type: "TEXT",
            content: richContent({
                title: "Percursos em árvores",
                intro: [
                    "Percorrer uma árvore é visitar todos os nós em uma ordem definida.",
                    "Pré-ordem visita raiz antes das subárvores. Em-ordem visita esquerda, raiz e direita. Pós-ordem visita raiz por último.",
                    "Em ABB, o percurso em-ordem é especialmente importante porque produz os valores ordenados.",
                ],
                bullets: [
                    "Pré-ordem: raiz, esquerda, direita",
                    "Em-ordem: esquerda, raiz, direita",
                    "Pós-ordem: esquerda, direita, raiz",
                    "Percursos são normalmente recursivos",
                ],
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed2-l15",
            title: "Quiz: percurso em-ordem",
            type: "QUIZ",
            questionId: "ed2-q4",
            order: 15,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "ed2-l16",
            title: "Vídeo: Árvores Binárias de Busca",
            type: "VIDEO",
            content: videoContent(
                "Vídeo: Árvores Binárias de Busca",
                "Aula em vídeo para visualizar inserção, busca e percursos em árvores binárias de busca.",
                [
                    "Repare na regra esquerda/raiz/direita",
                    "Observe a recursão",
                    "Compare árvore balanceada e degenerada",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=oSWTXtMglKE",
            order: 16,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "ed2-l17",
            title: "Atividade: ABB completa",
            type: "ASSIGNMENT",
            taskId: "ed2-tk3",
            order: 17,
            xp: 300,
            durationMin: 130,
        },
        {
            id: "ed2-l18",
            title: "Atividade: análise de desempenho",
            type: "ASSIGNMENT",
            taskId: "ed2-tk4",
            order: 18,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const edAvancadoSpec: CourseSeed = {
    id: "ed-c3",
    title: "Estrutura de Dados: AVL, Grafos e Algoritmos",
    description:
        "Curso avançado com AVL, fator de balanceamento, rotações, grafos, representações, BFS e DFS.",
    language: "C",
    level: "ADVANCED",
    instructor:
        "Prof. Luciano Freire, Profa. Tiemi C. Sakata & Prof. Marco Montebello",
    banner: "from-streak to-accent",
    color: "streak",
    questions: [
        {
            id: "ed3-q1",
            question: "Qual é a principal vantagem de uma árvore AVL?",
            optionA: "Manter ciclos",
            optionB: "Garantir balanceamento e busca eficiente",
            optionC: "Eliminar ponteiros",
            optionD: "Permitir apenas folhas",
            correct: "B",
            explanation: "AVL mantém altura balanceada e operações O(log n).",
            xp: 50,
            difficulty: "ADVANCED",
        },
        {
            id: "ed3-q2",
            question: "Em AVL, o fator de balanceamento válido é:",
            optionA: "-1, 0 ou +1",
            optionB: "Somente 0",
            optionC: "Qualquer inteiro",
            optionD: "Apenas +2",
            correct: "A",
            explanation:
                "A diferença entre alturas das subárvores deve ser no máximo 1.",
            xp: 50,
            difficulty: "ADVANCED",
        },
        {
            id: "ed3-q3",
            question: "Qual operação corrige desbalanceamentos em AVL?",
            optionA: "Rotação",
            optionB: "Concatenação",
            optionC: "Criptografia",
            optionD: "Serialização",
            correct: "A",
            explanation: "Rotações reorganizam nós preservando a propriedade de ABB.",
            xp: 50,
            difficulty: "ADVANCED",
        },
        {
            id: "ed3-q4",
            question: "Um grafo G(V,A) possui:",
            optionA: "Vértices e arestas",
            optionB: "Pilhas e filas",
            optionC: "Somente raiz",
            optionD: "Apenas folhas",
            correct: "A",
            explanation: "V representa vértices e A arestas.",
            xp: 50,
            difficulty: "ADVANCED",
        },
        {
            id: "ed3-q5",
            question: "Dois vértices são adjacentes quando:",
            optionA: "Existe uma aresta entre eles",
            optionB: "Têm o mesmo nome",
            optionC: "Estão isolados",
            optionD: "São folhas",
            correct: "A",
            explanation: "Adjacência indica conexão direta por aresta.",
            xp: 50,
            difficulty: "ADVANCED",
        },
        {
            id: "ed3-q6",
            question: "Lista de adjacência costuma ser melhor para:",
            optionA: "Grafos esparsos",
            optionB: "Grafos com todos os vértices conectados a todos",
            optionC: "Vetores pequenos",
            optionD: "Pilhas estáticas",
            correct: "A",
            explanation:
                "Grafos esparsos têm poucas arestas e listas economizam espaço.",
            xp: 50,
            difficulty: "ADVANCED",
        },
    ],
    tasks: [
        {
            id: "ed3-tk1",
            title: "AVL: fator de balanceamento",
            description: "Calcule altura e fator de balanceamento de cada nó.",
            objective: "Identificar nós válidos e desbalanceados em AVL.",
            xp: 260,
            estimatedTime: "100 min",
            requirements: [
                "Implementar altura",
                "Calcular FB",
                "Exibir FB por nó",
                "Detectar violações",
                "Testar entradas variadas",
            ],
        },
        {
            id: "ed3-tk2",
            title: "AVL: rotações completas",
            description: "Implemente rotações simples e duplas.",
            objective: "Restaurar balanceamento preservando ABB.",
            xp: 320,
            estimatedTime: "140 min",
            requirements: [
                "Rotação direita",
                "Rotação esquerda",
                "Rotação esquerda-direita",
                "Rotação direita-esquerda",
                "Testar LL, RR, LR e RL",
            ],
        },
        {
            id: "ed3-tk3",
            title: "Grafos: mapa com pesos",
            description: "Modele cidades e estradas com grafo ponderado.",
            objective: "Aplicar vértices, arestas, pesos e adjacência.",
            xp: 280,
            estimatedTime: "110 min",
            requirements: [
                "5+ vértices",
                "7+ arestas",
                "Pesos nas arestas",
                "Lista de adjacência",
                "Consulta de vizinhos",
            ],
        },
        {
            id: "ed3-tk4",
            title: "Grafos: BFS e DFS",
            description: "Implemente busca em largura e profundidade.",
            objective: "Comparar estratégias de exploração em grafos.",
            xp: 320,
            estimatedTime: "140 min",
            requirements: [
                "Implementar BFS com fila",
                "Implementar DFS com pilha ou recursão",
                "Controlar visitados",
                "Testar grafo desconexo",
                "Relatar ordem de visita",
            ],
        },
    ],
    lessons: [
        {
            id: "ed3-l1",
            title: "Árvores AVL: motivação",
            type: "TEXT",
            content: richContent({
                title: "Árvores AVL: motivação",
                intro: [
                    "Árvores binárias de busca são eficientes quando estão balanceadas, mas inserções em certas ordens podem gerar estruturas degeneradas.",
                    "A árvore AVL resolve esse problema mantendo a diferença de altura entre subárvores em no máximo 1.",
                    "Segundo os slides, busca, inserção e remoção em AVL podem ser realizadas em O(log n), mesmo no pior caso.",
                ],
                bullets: [
                    "AVL é uma ABB balanceada",
                    "Criada por Adelson-Velskii e Landis",
                    "Mantém altura controlada",
                    "Evita degradação para comportamento de lista",
                ],
                image: treeImg,
            }),
            order: 1,
            xp: 100,
            durationMin: 35,
        },
        {
            id: "ed3-l2",
            title: "Definição formal de AVL",
            type: "TEXT",
            content: richContent({
                title: "Definição formal de AVL",
                intro: [
                    "Uma árvore T é AVL se ela é vazia ou se é uma ABB cujas subárvores esquerda e direita também são AVL.",
                    "Além disso, a diferença absoluta entre as alturas das subárvores deve ser menor ou igual a 1.",
                    "Essa definição é recursiva: cada subárvore precisa obedecer às mesmas regras.",
                ],
                bullets: [
                    "T é ABB",
                    "L e R são AVL",
                    "|hL - hR| ≤ 1",
                    "A propriedade vale para todos os nós",
                ],
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "ed3-l3",
            title: "Quiz: conceito de AVL",
            type: "QUIZ",
            questionId: "ed3-q1",
            order: 3,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l4",
            title: "Fator de balanceamento",
            type: "TEXT",
            content: richContent({
                title: "Fator de balanceamento",
                intro: [
                    "O fator de balanceamento indica se um nó está equilibrado. Ele é calculado como altura da esquerda menos altura da direita.",
                    "Em uma AVL válida, o fator deve ser -1, 0 ou +1. Se chegar a -2 ou +2, a árvore precisa de rotação.",
                    "Esse cálculo guia a escolha da correção necessária após inserções ou remoções.",
                ],
                bullets: [
                    "FB = hL - hR",
                    "FB positivo: esquerda mais alta",
                    "FB negativo: direita mais alta",
                    "FB fora do intervalo exige correção",
                ],
                code: `int fb(No* n) {
  return altura(n->esq) - altura(n->dir);
}`,
            }),
            order: 4,
            xp: 100,
            durationMin: 35,
        },
        {
            id: "ed3-l5",
            title: "Quiz: fator de balanceamento",
            type: "QUIZ",
            questionId: "ed3-q2",
            order: 5,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l6",
            title: "Atividade: fator de balanceamento",
            type: "ASSIGNMENT",
            taskId: "ed3-tk1",
            order: 6,
            xp: 260,
            durationMin: 100,
        },
        {
            id: "ed3-l7",
            title: "Rotações em AVL",
            type: "TEXT",
            content: richContent({
                title: "Rotações em AVL",
                intro: [
                    "Rotações são transformações que reorganizam a árvore para restaurar balanceamento sem quebrar a regra da ABB.",
                    "O percurso em-ordem antes e depois da rotação deve continuar igual, garantindo que a ordenação permaneça correta.",
                    "Existem casos simples e duplos: LL, RR, LR e RL.",
                ],
                bullets: [
                    "LL: rotação à direita",
                    "RR: rotação à esquerda",
                    "LR: esquerda no filho e direita no nó",
                    "RL: direita no filho e esquerda no nó",
                ],
                code: `// ideia da rotação à direita
y = x->esq;
x->esq = y->dir;
y->dir = x;`,
            }),
            order: 7,
            xp: 110,
            durationMin: 35,
        },
        {
            id: "ed3-l8",
            title: "Quiz: rotações",
            type: "QUIZ",
            questionId: "ed3-q3",
            order: 8,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l9",
            title: "Vídeo: AVL e rotações",
            type: "VIDEO",
            content: videoContent(
                "Vídeo: AVL e rotações",
                "Vídeo de apoio para visualizar a estrutura, acompanhar exemplos e reforçar a implementação.",
                [
                    "Anote os casos especiais",
                    "Reproduza os exemplos",
                    "Compare com o material textual",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=YkF76cOgtMQ",
            order: 9,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "ed3-l10",
            title: "Atividade: rotações AVL",
            type: "ASSIGNMENT",
            taskId: "ed3-tk2",
            order: 10,
            xp: 320,
            durationMin: 140,
        },
        {
            id: "ed3-l11",
            title: "Introdução aos grafos",
            type: "TEXT",
            content: richContent({
                title: "Introdução aos grafos",
                intro: [
                    "Grafos modelam relações entre objetos. Um grafo G(V,A) é composto por vértices e arestas.",
                    "Os slides destacam que a modelagem depende da natureza do problema e do objetivo: pessoas, tarefas, lugares, computadores e rotas podem ser vértices.",
                    "Arestas representam relações, como amizade, estrada, dependência ou conexão de rede.",
                ],
                bullets: [
                    "Vértice representa entidade",
                    "Aresta representa relação",
                    "Adjacência indica conexão direta",
                    "Grafos modelam problemas do mundo real",
                ],
                image: edImg,
            }),
            order: 11,
            xp: 100,
            durationMin: 35,
        },
        {
            id: "ed3-l12",
            title: "Quiz: grafos",
            type: "QUIZ",
            questionId: "ed3-q4",
            order: 12,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l13",
            title: "Vértices, arestas e adjacência",
            type: "TEXT",
            content: richContent({
                title: "Vértices, arestas e adjacência",
                intro: [
                    "Um vértice é cada entidade do grafo. Uma aresta conecta dois vértices e define uma relação.",
                    "Dois vértices são adjacentes quando existe uma aresta entre eles.",
                    "Em um mapa, cidades podem ser vértices e estradas podem ser arestas. Em tarefas, atividades podem ser vértices e pré-requisitos podem ser arestas direcionadas.",
                ],
                bullets: [
                    "Adjacência é conexão direta",
                    "Arestas podem ter peso",
                    "Grafos podem ser direcionados ou não",
                    "A interpretação depende do problema",
                ],
            }),
            order: 13,
            xp: 100,
            durationMin: 35,
        },
        {
            id: "ed3-l14",
            title: "Quiz: adjacência",
            type: "QUIZ",
            questionId: "ed3-q5",
            order: 14,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l15",
            title: "Representação de grafos",
            type: "TEXT",
            content: richContent({
                title: "Representação de grafos",
                intro: [
                    "Duas representações comuns são matriz de adjacência e lista de adjacência.",
                    "A matriz é simples para verificar conexão entre dois vértices, mas pode gastar muita memória em grafos grandes e esparsos.",
                    "A lista de adjacência economiza espaço quando há poucas arestas e facilita percorrer vizinhos.",
                ],
                bullets: [
                    "Matriz: consulta direta",
                    "Lista: eficiente para grafos esparsos",
                    "Pesos podem ser armazenados junto à aresta",
                    "Escolha depende de V e A",
                ],
                code: `// lista de adjacência conceitual
0: (1, peso 5), (3, peso 2)
1: (2, peso 7)`,
            }),
            order: 15,
            xp: 110,
            durationMin: 35,
        },
        {
            id: "ed3-l16",
            title: "Quiz: representação",
            type: "QUIZ",
            questionId: "ed3-q6",
            order: 16,
            xp: 50,
            durationMin: 5,
        },
        {
            id: "ed3-l17",
            title: "Vídeo: grafos",
            type: "VIDEO",
            content: videoContent(
                "Vídeo: grafos",
                "Vídeo de apoio para visualizar a estrutura, acompanhar exemplos e reforçar a implementação.",
                [
                    "Anote os casos especiais",
                    "Reproduza os exemplos",
                    "Compare com o material textual",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=DBRW8nwZV-g",
            order: 17,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "ed3-l18",
            title: "Atividade: mapa com grafos",
            type: "ASSIGNMENT",
            taskId: "ed3-tk3",
            order: 18,
            xp: 280,
            durationMin: 110,
        },
        {
            id: "ed3-l19",
            title: "Busca em largura e profundidade",
            type: "TEXT",
            content: richContent({
                title: "Busca em largura e profundidade",
                intro: [
                    "BFS e DFS são estratégias clássicas para percorrer grafos.",
                    "BFS usa fila e explora por camadas, sendo útil para menor número de arestas em grafos não ponderados.",
                    "DFS usa recursão ou pilha e aprofunda caminhos antes de voltar, sendo útil para componentes, ciclos e ordenações.",
                ],
                bullets: [
                    "BFS usa fila",
                    "DFS usa pilha ou recursão",
                    "Ambas precisam marcar visitados",
                    "A escolha depende do problema",
                ],
            }),
            order: 19,
            xp: 110,
            durationMin: 35,
        },
        {
            id: "ed3-l20",
            title: "Atividade: BFS e DFS",
            type: "ASSIGNMENT",
            taskId: "ed3-tk4",
            order: 20,
            xp: 320,
            durationMin: 140,
        },
    ],
};

const webFundamentosSpec: CourseSeed = {
    id: "web-c1",
    title: "Desenvolvimento Web: Fundamentos Profissionais",
    description:
        "Curso completo de fundamentos web com planejamento, UX, Git, hospedagem, HTML, CSS, JavaScript e deploy.",
    language: "Web",
    level: "BEGINNER",
    instructor: "Prof. Me. Deivison S. Takatu",
    banner: "from-success to-secondary",
    color: "success",
    questions: [
        {
            id: "web1-q1",
            question:
                "Por que o escopo deve ser definido antes da codificação de um projeto web?",
            optionA:
                "Para reduzir retrabalho, alinhar expectativas e orientar o backlog",
            optionB: "Para impedir qualquer mudança futura",
            optionC: "Para substituir testes automatizados",
            optionD: "Para eliminar a necessidade de protótipos",
            correct: "A",
            explanation:
                "Os slides de escopo e UX reforçam que planejamento reduz riscos, evita escopo indefinido e melhora o alinhamento entre equipe e entrega.",
            xp: 40,
            difficulty: "BEGINNER",
        },
        {
            id: "web1-q2",
            question: "Qual é a diferença principal entre versionamento e backup?",
            optionA: "Backup registra autoria de cada alteração",
            optionB:
                "Versionamento mantém histórico, autoria e permite reversão granular",
            optionC: "Backup permite merge automático entre equipes",
            optionD: "Versionamento serve apenas para imagens",
            correct: "B",
            explanation:
                "Versionamento acompanha mudanças ao longo do tempo; backup é uma cópia pontual do estado atual.",
            xp: 40,
            difficulty: "BEGINNER",
        },
        {
            id: "web1-q3",
            question: "Em HTML, CSS e JavaScript, qual combinação está correta?",
            optionA: "HTML interatividade, CSS banco de dados, JS hospedagem",
            optionB: "HTML estrutura, CSS aparência, JavaScript comportamento",
            optionC: "HTML servidor, CSS API, JS domínio",
            optionD: "HTML deploy, CSS versionamento, JS backup",
            correct: "B",
            explanation:
                "HTML organiza o conteúdo, CSS define apresentação visual e JavaScript adiciona comportamento dinâmico.",
            xp: 40,
            difficulty: "BEGINNER",
        },
    ],
    tasks: [
        {
            id: "web1-tk1",
            title: "Atividade: Definição de escopo",
            description: "Pratique Definição de escopo com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Definição de escopo em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Definição de escopo",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web1-tk2",
            title: "Atividade: Página institucional responsiva",
            description:
                "Pratique Página institucional responsiva com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Página institucional responsiva em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Página institucional responsiva",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web1-tk3",
            title: "Atividade: Publicação do projeto",
            description: "Pratique Publicação do projeto com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Publicação do projeto em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Publicação do projeto",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "web1-l1",
            title: "Panorama do desenvolvimento web",
            type: "TEXT",
            content: richContent({
                title: "Panorama do desenvolvimento web",
                intro: [
                    "Nesta etapa, vamos trabalhar Panorama do desenvolvimento web com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Panorama do desenvolvimento web",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Panorama do desenvolvimento web é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l2",
            title: "Tipos de aplicações web",
            type: "TEXT",
            content: richContent({
                title: "Tipos de aplicações web",
                intro: [
                    "Nesta etapa, vamos trabalhar Tipos de aplicações web com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Tipos de aplicações web",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Tipos de aplicações web é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l3",
            title: "Escopo, backlog e UX",
            type: "TEXT",
            content: richContent({
                title: "Escopo, backlog e UX",
                intro: [
                    "Nesta etapa, vamos trabalhar Escopo, backlog e UX com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Escopo, backlog e UX",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Escopo, backlog e UX é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l4",
            title: "Quiz: Escopo e planejamento",
            type: "QUIZ",
            questionId: "web1-q1",
            order: 4,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web1-l5",
            title: "Atividade: Definição de escopo",
            type: "ASSIGNMENT",
            taskId: "web1-tk1",
            order: 5,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web1-l6",
            title: "Versionamento com Git",
            type: "TEXT",
            content: richContent({
                title: "Versionamento com Git",
                intro: [
                    "Nesta etapa, vamos trabalhar Versionamento com Git com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Versionamento com Git",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Versionamento com Git é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l7",
            title: "Branches, merge e SemVer",
            type: "TEXT",
            content: richContent({
                title: "Branches, merge e SemVer",
                intro: [
                    "Nesta etapa, vamos trabalhar Branches, merge e SemVer com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Branches, merge e SemVer",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Branches, merge e SemVer é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l8",
            title: "Vídeo de Git e versionamento",
            type: "VIDEO",
            content: videoContent(
                "Vídeo de Git e versionamento",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=Fhy-5CtVkiM",
            order: 8,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "web1-l9",
            title: "Quiz: Git e versionamento",
            type: "QUIZ",
            questionId: "web1-q2",
            order: 9,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web1-l10",
            title: "Deploy e hospedagem",
            type: "TEXT",
            content: richContent({
                title: "Deploy e hospedagem",
                intro: [
                    "Nesta etapa, vamos trabalhar Deploy e hospedagem com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Deploy e hospedagem",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Deploy e hospedagem é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l11",
            title: "Domínio, servidor e CMS",
            type: "TEXT",
            content: richContent({
                title: "Domínio, servidor e CMS",
                intro: [
                    "Nesta etapa, vamos trabalhar Domínio, servidor e CMS com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Domínio, servidor e CMS",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "Domínio, servidor e CMS é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l12",
            title: "HTML5 semântico",
            type: "TEXT",
            content: richContent({
                title: "HTML5 semântico",
                intro: [
                    "Nesta etapa, vamos trabalhar HTML5 semântico com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de HTML5 semântico",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "HTML5 semântico é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l13",
            title: "CSS e responsividade",
            type: "TEXT",
            content: richContent({
                title: "CSS e responsividade",
                intro: [
                    "Nesta etapa, vamos trabalhar CSS e responsividade com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de CSS e responsividade",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "CSS e responsividade é uma etapa importante para avançar na trilha.",
            }),
            order: 13,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l14",
            title: "JavaScript Vanilla",
            type: "TEXT",
            content: richContent({
                title: "JavaScript Vanilla",
                intro: [
                    "Nesta etapa, vamos trabalhar JavaScript Vanilla com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de JavaScript Vanilla",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: webImg,
                callout:
                    "JavaScript Vanilla é uma etapa importante para avançar na trilha.",
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web1-l15",
            title: "Vídeo HTML CSS JS",
            type: "VIDEO",
            content: videoContent(
                "Vídeo HTML CSS JS",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=Fhy-5CtVkiM",
            order: 15,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "web1-l16",
            title: "Quiz: HTML, CSS e JavaScript",
            type: "QUIZ",
            questionId: "web1-q3",
            order: 16,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web1-l17",
            title: "Atividade: Página institucional responsiva",
            type: "ASSIGNMENT",
            taskId: "web1-tk2",
            order: 17,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web1-l18",
            title: "Atividade: Publicação do projeto",
            type: "ASSIGNMENT",
            taskId: "web1-tk3",
            order: 18,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const webFrontendSpec: CourseSeed = {
    id: "web-c2",
    title: "Desenvolvimento Web: Front-end Moderno",
    description:
        "Curso intermediário com React, frameworks, Node.js, NPM, APIs, LocalStorage, SEO e projeto completo.",
    language: "JavaScript/React",
    level: "INTERMEDIATE",
    instructor: "Prof. Me. Deivison S. Takatu",
    banner: "from-secondary to-primary",
    color: "secondary",
    questions: [
        {
            id: "web2-q1",
            question:
                "Qual arquivo registra scripts e dependências em um projeto Node.js?",
            optionA: "index.html",
            optionB: "package.json",
            optionC: "style.css",
            optionD: "README.deploy",
            correct: "B",
            explanation:
                "O package.json descreve o projeto, dependências, versões e scripts executados pelo NPM.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "web2-q2",
            question:
                "Segundo os slides, qual alternativa diferencia melhor framework de biblioteca?",
            optionA:
                "Framework controla parte do fluxo da aplicação; biblioteca é chamada pelo desenvolvedor quando necessário",
            optionB: "Biblioteca sempre exige roteamento e autenticação",
            optionC: "Framework só existe no back-end",
            optionD: "React é protocolo HTTP",
            correct: "A",
            explanation:
                "Frameworks tendem a impor estrutura; bibliotecas são usadas de forma mais pontual e flexível.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "web2-tk1",
            title: "Atividade: Projeto React inicial",
            description: "Pratique Projeto React inicial com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto React inicial em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto React inicial",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web2-tk2",
            title: "Atividade: Projeto front-end completo",
            description:
                "Pratique Projeto front-end completo com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto front-end completo em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto front-end completo",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web2-tk3",
            title: "Atividade: Deploy front-end",
            description: "Pratique Deploy front-end com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Deploy front-end em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Deploy front-end",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "web2-l1",
            title: "Frameworks front-end",
            type: "TEXT",
            content: richContent({
                title: "Frameworks front-end",
                intro: [
                    "Nesta etapa, vamos trabalhar Frameworks front-end com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Frameworks front-end",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Frameworks front-end é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l2",
            title: "Framework x biblioteca",
            type: "TEXT",
            content: richContent({
                title: "Framework x biblioteca",
                intro: [
                    "Nesta etapa, vamos trabalhar Framework x biblioteca com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Framework x biblioteca",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Framework x biblioteca é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l3",
            title: "Node.js e NPM",
            type: "TEXT",
            content: richContent({
                title: "Node.js e NPM",
                intro: [
                    "Nesta etapa, vamos trabalhar Node.js e NPM com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Node.js e NPM",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout: "Node.js e NPM é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l4",
            title: "Quiz: Node.js e NPM",
            type: "QUIZ",
            questionId: "web2-q1",
            order: 4,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web2-l5",
            title: "React e componentização",
            type: "TEXT",
            content: richContent({
                title: "React e componentização",
                intro: [
                    "Nesta etapa, vamos trabalhar React e componentização com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de React e componentização",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "React e componentização é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l6",
            title: "Vídeo React",
            type: "VIDEO",
            content: videoContent(
                "Vídeo React",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=Fhy-5CtVkiM",
            order: 6,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "web2-l7",
            title: "Estado, props e eventos",
            type: "TEXT",
            content: richContent({
                title: "Estado, props e eventos",
                intro: [
                    "Nesta etapa, vamos trabalhar Estado, props e eventos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Estado, props e eventos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Estado, props e eventos é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l8",
            title: "Atividade: Projeto React inicial",
            type: "ASSIGNMENT",
            taskId: "web2-tk1",
            order: 8,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web2-l9",
            title: "Angular e Vue em perspectiva",
            type: "TEXT",
            content: richContent({
                title: "Angular e Vue em perspectiva",
                intro: [
                    "Nesta etapa, vamos trabalhar Angular e Vue em perspectiva com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Angular e Vue em perspectiva",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Angular e Vue em perspectiva é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l10",
            title: "Consumo de API no front-end",
            type: "TEXT",
            content: richContent({
                title: "Consumo de API no front-end",
                intro: [
                    "Nesta etapa, vamos trabalhar Consumo de API no front-end com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Consumo de API no front-end",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Consumo de API no front-end é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l11",
            title: "LocalStorage e persistência",
            type: "TEXT",
            content: richContent({
                title: "LocalStorage e persistência",
                intro: [
                    "Nesta etapa, vamos trabalhar LocalStorage e persistência com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de LocalStorage e persistência",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "LocalStorage e persistência é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l12",
            title: "SEO e acessibilidade",
            type: "TEXT",
            content: richContent({
                title: "SEO e acessibilidade",
                intro: [
                    "Nesta etapa, vamos trabalhar SEO e acessibilidade com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de SEO e acessibilidade",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "SEO e acessibilidade é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l13",
            title: "Quiz: Frameworks e bibliotecas",
            type: "QUIZ",
            questionId: "web2-q2",
            order: 13,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web2-l14",
            title: "Formulários e validação",
            type: "TEXT",
            content: richContent({
                title: "Formulários e validação",
                intro: [
                    "Nesta etapa, vamos trabalhar Formulários e validação com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Formulários e validação",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: reactImg,
                callout:
                    "Formulários e validação é uma etapa importante para avançar na trilha.",
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web2-l15",
            title: "Atividade: Projeto front-end completo",
            type: "ASSIGNMENT",
            taskId: "web2-tk2",
            order: 15,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web2-l16",
            title: "Atividade: Deploy front-end",
            type: "ASSIGNMENT",
            taskId: "web2-tk3",
            order: 16,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const webBackendSpec: CourseSeed = {
    id: "web-c3",
    title: "Desenvolvimento Web: Back-end e APIs",
    description:
        "Curso intermediário com HTTP, REST, JSON, Node.js, Express, CRUD, testes, documentação e deploy.",
    language: "Node.js",
    level: "INTERMEDIATE",
    instructor: "Prof. Me. Deivison S. Takatu",
    banner: "from-accent to-streak",
    color: "accent",
    questions: [
        {
            id: "web3-q1",
            question:
                "Qual método HTTP é mais indicado para criar um novo recurso em uma API REST?",
            optionA: "GET",
            optionB: "POST",
            optionC: "DELETE",
            optionD: "HEAD",
            correct: "B",
            explanation:
                "Nos slides de back-end, POST aparece como método usado para criar novos recursos no servidor.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "web3-tk1",
            title: "Atividade: CRUD em memória",
            description: "Pratique CRUD em memória com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de CRUD em memória em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de CRUD em memória",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web3-tk2",
            title: "Atividade: Testes de endpoints",
            description: "Pratique Testes de endpoints com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Testes de endpoints em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Testes de endpoints",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "web3-tk3",
            title: "Atividade: API REST completa",
            description: "Pratique API REST completa com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de API REST completa em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de API REST completa",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "web3-l1",
            title: "Fundamentos de back-end",
            type: "TEXT",
            content: richContent({
                title: "Fundamentos de back-end",
                intro: [
                    "Nesta etapa, vamos trabalhar Fundamentos de back-end com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Fundamentos de back-end",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Fundamentos de back-end é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l2",
            title: "Arquitetura MVC e camadas",
            type: "TEXT",
            content: richContent({
                title: "Arquitetura MVC e camadas",
                intro: [
                    "Nesta etapa, vamos trabalhar Arquitetura MVC e camadas com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Arquitetura MVC e camadas",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Arquitetura MVC e camadas é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l3",
            title: "HTTP e modelo cliente-servidor",
            type: "TEXT",
            content: richContent({
                title: "HTTP e modelo cliente-servidor",
                intro: [
                    "Nesta etapa, vamos trabalhar HTTP e modelo cliente-servidor com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de HTTP e modelo cliente-servidor",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "HTTP e modelo cliente-servidor é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l4",
            title: "Métodos REST",
            type: "TEXT",
            content: richContent({
                title: "Métodos REST",
                intro: [
                    "Nesta etapa, vamos trabalhar Métodos REST com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Métodos REST",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout: "Métodos REST é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l5",
            title: "Quiz: Métodos HTTP",
            type: "QUIZ",
            questionId: "web3-q1",
            order: 5,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "web3-l6",
            title: "JSON e troca de dados",
            type: "TEXT",
            content: richContent({
                title: "JSON e troca de dados",
                intro: [
                    "Nesta etapa, vamos trabalhar JSON e troca de dados com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de JSON e troca de dados",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "JSON e troca de dados é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l7",
            title: "Node.js no servidor",
            type: "TEXT",
            content: richContent({
                title: "Node.js no servidor",
                intro: [
                    "Nesta etapa, vamos trabalhar Node.js no servidor com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Node.js no servidor",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Node.js no servidor é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l8",
            title: "Express.js",
            type: "TEXT",
            content: richContent({
                title: "Express.js",
                intro: [
                    "Nesta etapa, vamos trabalhar Express.js com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Express.js",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout: "Express.js é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l9",
            title: "Vídeo: API REST com Node.js e Express",
            type: "VIDEO",
            content: videoContent(
                "API REST com Node.js e Express",
                "Assista a uma aula prática em português sobre rotas, métodos HTTP, JSON e organização de uma API REST com Node.js.",
                [
                    "Observe como as rotas são nomeadas",
                    "Compare GET, POST, PATCH/PUT e DELETE",
                    "Repare no formato das respostas JSON",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=ghTrp1x_1As",
            order: 9,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "web3-l10",
            title: "Rotas e middlewares",
            type: "TEXT",
            content: richContent({
                title: "Rotas e middlewares",
                intro: [
                    "Nesta etapa, vamos trabalhar Rotas e middlewares com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Rotas e middlewares",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Rotas e middlewares é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l11",
            title: "Atividade: CRUD em memória",
            type: "ASSIGNMENT",
            taskId: "web3-tk1",
            order: 11,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web3-l12",
            title: "Validação e tratamento de erros",
            type: "TEXT",
            content: richContent({
                title: "Validação e tratamento de erros",
                intro: [
                    "Nesta etapa, vamos trabalhar Validação e tratamento de erros com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Validação e tratamento de erros",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Validação e tratamento de erros é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l13",
            title: "Documentação de API",
            type: "TEXT",
            content: richContent({
                title: "Documentação de API",
                intro: [
                    "Nesta etapa, vamos trabalhar Documentação de API com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Documentação de API",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Documentação de API é uma etapa importante para avançar na trilha.",
            }),
            order: 13,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l14",
            title: "Atividade: Testes de endpoints",
            type: "ASSIGNMENT",
            taskId: "web3-tk2",
            order: 14,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "web3-l15",
            title: "Deploy e integração front-back",
            type: "TEXT",
            content: richContent({
                title: "Deploy e integração front-back",
                intro: [
                    "Nesta etapa, vamos trabalhar Deploy e integração front-back com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Deploy e integração front-back",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: nodeImg,
                callout:
                    "Deploy e integração front-back é uma etapa importante para avançar na trilha.",
            }),
            order: 15,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "web3-l16",
            title: "Atividade: API REST completa",
            type: "ASSIGNMENT",
            taskId: "web3-tk3",
            order: 16,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const soFundamentosSpec: CourseSeed = {
    id: "so-c1",
    title: "Sistemas Operacionais: Fundamentos e Evolução",
    description:
        "Curso completo sobre definição, funções, evolução histórica, tipos e arquitetura inicial de sistemas operacionais.",
    language: "General",
    level: "BEGINNER",
    instructor: "Prof. Jones Artur Gonçalves",
    banner: "from-primary to-secondary",
    color: "primary",
    questions: [
        {
            id: "so1-q1",
            question: "Qual é a principal função de um sistema operacional?",
            optionA:
                "Gerenciar recursos de hardware e oferecer uma interface controlada para programas e usuários",
            optionB: "Substituir todos os aplicativos",
            optionC: "Eliminar a memória principal",
            optionD: "Executar apenas um processo para sempre",
            correct: "A",
            explanation:
                "O SO gerencia processador, memória, dispositivos, arquivos e fornece uma camada de uso mais segura e simples.",
            xp: 40,
            difficulty: "BEGINNER",
        },
        {
            id: "so1-q2",
            question: "O que caracteriza um sistema multiprogramável?",
            optionA: "Executa apenas um programa por vez",
            optionB: "Permite que vários programas compartilhem recursos do sistema",
            optionC: "Não usa memória principal",
            optionD: "Não possui dispositivos de entrada e saída",
            correct: "B",
            explanation:
                "Em sistemas multiprogramáveis, CPU, memória e dispositivos são compartilhados entre programas, aumentando aproveitamento dos recursos.",
            xp: 40,
            difficulty: "BEGINNER",
        },
    ],
    tasks: [
        {
            id: "so1-tk1",
            title: "Atividade: Exercício de classificação de SO",
            description:
                "Pratique Exercício de classificação de SO com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Exercício de classificação de SO em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Exercício de classificação de SO",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "so1-tk2",
            title: "Atividade: Mapa mental de SO",
            description: "Pratique Mapa mental de SO com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Mapa mental de SO em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Mapa mental de SO",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "so1-l1",
            title: "O que é sistema operacional",
            type: "TEXT",
            content: richContent({
                title: "O que é sistema operacional",
                intro: [
                    "Nesta etapa, vamos trabalhar O que é sistema operacional com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de O que é sistema operacional",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "O que é sistema operacional é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l2",
            title: "Máquina em camadas",
            type: "TEXT",
            content: richContent({
                title: "Máquina em camadas",
                intro: [
                    "Nesta etapa, vamos trabalhar Máquina em camadas com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Máquina em camadas",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Máquina em camadas é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l3",
            title: "Funções do sistema operacional",
            type: "TEXT",
            content: richContent({
                title: "Funções do sistema operacional",
                intro: [
                    "Nesta etapa, vamos trabalhar Funções do sistema operacional com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Funções do sistema operacional",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Funções do sistema operacional é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l4",
            title: "História da computação",
            type: "TEXT",
            content: richContent({
                title: "História da computação",
                intro: [
                    "Nesta etapa, vamos trabalhar História da computação com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de História da computação",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "História da computação é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l5",
            title: "Quiz: Fundamentos de Sistemas Operacionais",
            type: "QUIZ",
            questionId: "so1-q1",
            order: 5,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "so1-l6",
            title: "Sistemas monotarefa e multitarefa",
            type: "TEXT",
            content: richContent({
                title: "Sistemas monotarefa e multitarefa",
                intro: [
                    "Nesta etapa, vamos trabalhar Sistemas monotarefa e multitarefa com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Sistemas monotarefa e multitarefa",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Sistemas monotarefa e multitarefa é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l7",
            title: "Batch, tempo compartilhado e tempo real",
            type: "TEXT",
            content: richContent({
                title: "Batch, tempo compartilhado e tempo real",
                intro: [
                    "Nesta etapa, vamos trabalhar Batch, tempo compartilhado e tempo real com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Batch, tempo compartilhado e tempo real",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Batch, tempo compartilhado e tempo real é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l8",
            title: "Múltiplos processadores",
            type: "TEXT",
            content: richContent({
                title: "Múltiplos processadores",
                intro: [
                    "Nesta etapa, vamos trabalhar Múltiplos processadores com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Múltiplos processadores",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Múltiplos processadores é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l9",
            title: "Vídeo: Introdução aos Sistemas Operacionais",
            type: "VIDEO",
            content: videoContent(
                "Introdução aos Sistemas Operacionais",
                "Aula em português para revisar definição, objetivos, classificação e papel do sistema operacional como camada entre usuário, aplicações e hardware.",
                [
                    "Anote a definição de SO",
                    "Identifique exemplos de recursos gerenciados",
                    "Relacione com os tipos de sistemas vistos nos slides",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=C6qMnRDKOBc",
            order: 9,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "so1-l10",
            title: "Atividade: Exercício de classificação de SO",
            type: "ASSIGNMENT",
            taskId: "so1-tk1",
            order: 10,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "so1-l11",
            title: "Interface usuário e hardware",
            type: "TEXT",
            content: richContent({
                title: "Interface usuário e hardware",
                intro: [
                    "Nesta etapa, vamos trabalhar Interface usuário e hardware com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Interface usuário e hardware",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Interface usuário e hardware é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l12",
            title: "Detecção de erros e segurança",
            type: "TEXT",
            content: richContent({
                title: "Detecção de erros e segurança",
                intro: [
                    "Nesta etapa, vamos trabalhar Detecção de erros e segurança com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Detecção de erros e segurança",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Detecção de erros e segurança é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l13",
            title: "Revisão guiada",
            type: "TEXT",
            content: richContent({
                title: "Revisão guiada",
                intro: [
                    "Nesta etapa, vamos trabalhar Revisão guiada com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Revisão guiada",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Revisão guiada é uma etapa importante para avançar na trilha.",
            }),
            order: 13,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so1-l14",
            title: "Quiz: Tipos de Sistemas Operacionais",
            type: "QUIZ",
            questionId: "so1-q2",
            order: 14,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "so1-l15",
            title: "Atividade: Mapa mental de SO",
            type: "ASSIGNMENT",
            taskId: "so1-tk2",
            order: 15,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const soProcessosSpec: CourseSeed = {
    id: "so-c2",
    title: "Sistemas Operacionais: Kernel, Concorrência e Processos",
    description:
        "Curso intermediário sobre concorrência, interrupções, kernel, system calls, processos, PCB e estados.",
    language: "General",
    level: "INTERMEDIATE",
    instructor: "Prof. Jones Artur Gonçalves",
    banner: "from-secondary to-primary",
    color: "secondary",
    questions: [
        {
            id: "so2-q1",
            question:
                "Por que aplicações comuns não devem acessar diretamente o modo kernel?",
            optionA:
                "Porque isso poderia comprometer a segurança e a integridade do sistema operacional",
            optionB: "Porque o kernel só executa CSS",
            optionC: "Porque chamadas de sistema não existem",
            optionD: "Porque todo processo precisa ser zombie",
            correct: "A",
            explanation:
                "O modo usuário limita instruções privilegiadas. Para acessar serviços do SO, a aplicação utiliza chamadas de sistema.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
        {
            id: "so2-q2",
            question: "O que é um processo no contexto de sistemas operacionais?",
            optionA:
                "Um programa em execução, com estado, contexto e recursos associados",
            optionB: "Um arquivo parado no disco sem execução",
            optionC: "Um tipo de monitor",
            optionD: "Uma partição de boot",
            correct: "A",
            explanation:
                "O processo é a forma como o SO enxerga um programa em execução, incluindo contexto de hardware, software e espaço de endereçamento.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "so2-tk1",
            title: "Atividade: Simulação de estados",
            description: "Pratique Simulação de estados com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Simulação de estados em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Simulação de estados",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "so2-tk2",
            title: "Atividade: Relatório de concorrência",
            description:
                "Pratique Relatório de concorrência com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Relatório de concorrência em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Relatório de concorrência",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "so2-l1",
            title: "Concorrência e multiprogramação",
            type: "TEXT",
            content: richContent({
                title: "Concorrência e multiprogramação",
                intro: [
                    "Nesta etapa, vamos trabalhar Concorrência e multiprogramação com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Concorrência e multiprogramação",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Concorrência e multiprogramação é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l2",
            title: "Interrupções e exceções",
            type: "TEXT",
            content: richContent({
                title: "Interrupções e exceções",
                intro: [
                    "Nesta etapa, vamos trabalhar Interrupções e exceções com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Interrupções e exceções",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Interrupções e exceções é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l3",
            title: "Entrada e saída",
            type: "TEXT",
            content: richContent({
                title: "Entrada e saída",
                intro: [
                    "Nesta etapa, vamos trabalhar Entrada e saída com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Entrada e saída",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Entrada e saída é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l4",
            title: "Kernel e rotinas do sistema",
            type: "TEXT",
            content: richContent({
                title: "Kernel e rotinas do sistema",
                intro: [
                    "Nesta etapa, vamos trabalhar Kernel e rotinas do sistema com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Kernel e rotinas do sistema",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Kernel e rotinas do sistema é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l5",
            title: "Modo usuário e modo kernel",
            type: "TEXT",
            content: richContent({
                title: "Modo usuário e modo kernel",
                intro: [
                    "Nesta etapa, vamos trabalhar Modo usuário e modo kernel com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Modo usuário e modo kernel",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Modo usuário e modo kernel é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l6",
            title: "System calls",
            type: "TEXT",
            content: richContent({
                title: "System calls",
                intro: [
                    "Nesta etapa, vamos trabalhar System calls com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de System calls",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout: "System calls é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l7",
            title: "Quiz: Kernel e modo usuário",
            type: "QUIZ",
            questionId: "so2-q1",
            order: 7,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "so2-l8",
            title: "Processos e programas",
            type: "TEXT",
            content: richContent({
                title: "Processos e programas",
                intro: [
                    "Nesta etapa, vamos trabalhar Processos e programas com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Processos e programas",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Processos e programas é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l9",
            title: "Contexto de processo e PCB",
            type: "TEXT",
            content: richContent({
                title: "Contexto de processo e PCB",
                intro: [
                    "Nesta etapa, vamos trabalhar Contexto de processo e PCB com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Contexto de processo e PCB",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Contexto de processo e PCB é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l10",
            title: "Estados de processo",
            type: "TEXT",
            content: richContent({
                title: "Estados de processo",
                intro: [
                    "Nesta etapa, vamos trabalhar Estados de processo com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Estados de processo",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Estados de processo é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l11",
            title: "Escalonamento básico",
            type: "TEXT",
            content: richContent({
                title: "Escalonamento básico",
                intro: [
                    "Nesta etapa, vamos trabalhar Escalonamento básico com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Escalonamento básico",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Escalonamento básico é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l12",
            title: "Vídeo: Funcionamento, processos e estados",
            type: "VIDEO",
            content: videoContent(
                "Funcionamento, processos e estados",
                "Aula em português para reforçar processos, mudanças de estado, multitarefa, multiprogramação e multiprocessamento.",
                [
                    "Observe como o SO alterna processos",
                    "Relacione estados com pronto, executando e espera",
                    "Compare multiprogramação e multiprocessamento",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=3hYy76Jc5u8",
            order: 12,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "so2-l13",
            title: "Atividade: Simulação de estados",
            type: "ASSIGNMENT",
            taskId: "so2-tk1",
            order: 13,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "so2-l14",
            title: "Prioridade e mudança de contexto",
            type: "TEXT",
            content: richContent({
                title: "Prioridade e mudança de contexto",
                intro: [
                    "Nesta etapa, vamos trabalhar Prioridade e mudança de contexto com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Prioridade e mudança de contexto",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: osImg,
                callout:
                    "Prioridade e mudança de contexto é uma etapa importante para avançar na trilha.",
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so2-l15",
            title: "Quiz: Processos e estados",
            type: "QUIZ",
            questionId: "so2-q2",
            order: 15,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "so2-l16",
            title: "Atividade: Relatório de concorrência",
            type: "ASSIGNMENT",
            taskId: "so2-tk2",
            order: 16,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const soLinuxSpec: CourseSeed = {
    id: "so-c3",
    title: "Sistemas Operacionais: Linux, Shell e Administração",
    description:
        "Curso prático de Linux, shell, diretórios, comandos, editores, processos, jobs, sinais e administração básica.",
    language: "Linux",
    level: "INTERMEDIATE",
    instructor: "Prof. Jones Artur Gonçalves",
    banner: "from-accent to-streak",
    color: "accent",
    questions: [
        {
            id: "so3-q1",
            question:
                "No Linux, qual diretório costuma conter arquivos de configuração do sistema?",
            optionA: "/home",
            optionB: "/etc",
            optionC: "/tmp",
            optionD: "/media",
            correct: "B",
            explanation:
                "O diretório /etc armazena arquivos de configuração usados pelo sistema e por serviços instalados.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "so3-tk1",
            title: "Atividade: Laboratório de comandos Linux",
            description:
                "Pratique Laboratório de comandos Linux com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Laboratório de comandos Linux em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Laboratório de comandos Linux",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "so3-tk2",
            title: "Atividade: Desafio final Linux",
            description: "Pratique Desafio final Linux com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Desafio final Linux em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Desafio final Linux",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "so3-l1",
            title: "Estrutura de diretórios Linux",
            type: "TEXT",
            content: richContent({
                title: "Estrutura de diretórios Linux",
                intro: [
                    "Nesta etapa, vamos trabalhar Estrutura de diretórios Linux com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Estrutura de diretórios Linux",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Estrutura de diretórios Linux é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l2",
            title: "Diretórios /bin /sbin /etc /home",
            type: "TEXT",
            content: richContent({
                title: "Diretórios /bin /sbin /etc /home",
                intro: [
                    "Nesta etapa, vamos trabalhar Diretórios /bin /sbin /etc /home com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Diretórios /bin /sbin /etc /home",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Diretórios /bin /sbin /etc /home é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l3",
            title: "Shell e Bash",
            type: "TEXT",
            content: richContent({
                title: "Shell e Bash",
                intro: [
                    "Nesta etapa, vamos trabalhar Shell e Bash com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Shell e Bash",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout: "Shell e Bash é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l4",
            title: "Comandos básicos",
            type: "TEXT",
            content: richContent({
                title: "Comandos básicos",
                intro: [
                    "Nesta etapa, vamos trabalhar Comandos básicos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Comandos básicos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Comandos básicos é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l5",
            title: "Pipes, filtros e redirecionamento",
            type: "TEXT",
            content: richContent({
                title: "Pipes, filtros e redirecionamento",
                intro: [
                    "Nesta etapa, vamos trabalhar Pipes, filtros e redirecionamento com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Pipes, filtros e redirecionamento",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Pipes, filtros e redirecionamento é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l6",
            title: "Editores Nano e Vi",
            type: "TEXT",
            content: richContent({
                title: "Editores Nano e Vi",
                intro: [
                    "Nesta etapa, vamos trabalhar Editores Nano e Vi com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Editores Nano e Vi",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Editores Nano e Vi é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l7",
            title: "Quiz: Terminal Linux",
            type: "QUIZ",
            questionId: "so3-q1",
            order: 7,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "so3-l8",
            title: "Processos no Linux com ps",
            type: "TEXT",
            content: richContent({
                title: "Processos no Linux com ps",
                intro: [
                    "Nesta etapa, vamos trabalhar Processos no Linux com ps com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Processos no Linux com ps",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Processos no Linux com ps é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l9",
            title: "top, pstree e pidof",
            type: "TEXT",
            content: richContent({
                title: "top, pstree e pidof",
                intro: [
                    "Nesta etapa, vamos trabalhar top, pstree e pidof com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de top, pstree e pidof",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "top, pstree e pidof é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l10",
            title: "kill, killall e sinais",
            type: "TEXT",
            content: richContent({
                title: "kill, killall e sinais",
                intro: [
                    "Nesta etapa, vamos trabalhar kill, killall e sinais com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de kill, killall e sinais",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "kill, killall e sinais é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l11",
            title: "Foreground, background e jobs",
            type: "TEXT",
            content: richContent({
                title: "Foreground, background e jobs",
                intro: [
                    "Nesta etapa, vamos trabalhar Foreground, background e jobs com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Foreground, background e jobs",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Foreground, background e jobs é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l12",
            title: "renice e prioridades",
            type: "TEXT",
            content: richContent({
                title: "renice e prioridades",
                intro: [
                    "Nesta etapa, vamos trabalhar renice e prioridades com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de renice e prioridades",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "renice e prioridades é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l13",
            title: "Vídeo shell Linux",
            type: "VIDEO",
            content: videoContent(
                "Vídeo shell Linux",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=rrB13utjYV4",
            order: 13,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "so3-l14",
            title: "Atividade: Laboratório de comandos Linux",
            type: "ASSIGNMENT",
            taskId: "so3-tk1",
            order: 14,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "so3-l15",
            title: "Administração básica",
            type: "TEXT",
            content: richContent({
                title: "Administração básica",
                intro: [
                    "Nesta etapa, vamos trabalhar Administração básica com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Administração básica",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: linuxImg,
                callout:
                    "Administração básica é uma etapa importante para avançar na trilha.",
            }),
            order: 15,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "so3-l16",
            title: "Atividade: Desafio final Linux",
            type: "ASSIGNMENT",
            taskId: "so3-tk2",
            order: 16,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const jsEssencialSpec: CourseSeed = {
    id: "js-c1",
    title: "JavaScript Essencial",
    description:
        "Curso completo de JavaScript puro: variáveis, funções, arrays, objetos, DOM, eventos e projetos.",
    language: "JavaScript",
    level: "BEGINNER",
    instructor: "Equipe Acadêmica",
    banner: "from-yellow-400 to-orange-500",
    color: "accent",
    questions: [
        {
            id: "js1-q1",
            question: "Qual é o papel do DOM em uma página web?",
            optionA:
                "Representar o documento HTML como objetos que o JavaScript pode consultar e modificar",
            optionB: "Compilar C para máquina",
            optionC: "Substituir o CSS",
            optionD: "Criar servidor Express automaticamente",
            correct: "A",
            explanation:
                "O DOM permite selecionar elementos, alterar textos, classes, atributos e reagir a eventos do usuário.",
            xp: 40,
            difficulty: "BEGINNER",
        },
    ],
    tasks: [
        {
            id: "js1-tk1",
            title: "Atividade: Calculadora JS",
            description: "Pratique Calculadora JS com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Calculadora JS em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Calculadora JS",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "js1-tk2",
            title: "Atividade: Lista de tarefas",
            description: "Pratique Lista de tarefas com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Lista de tarefas em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Lista de tarefas",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "js1-l1",
            title: "JavaScript na Web",
            type: "TEXT",
            content: richContent({
                title: "JavaScript na Web",
                intro: [
                    "Nesta etapa, vamos trabalhar JavaScript na Web com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de JavaScript na Web",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "JavaScript na Web é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l2",
            title: "Variáveis e tipos",
            type: "TEXT",
            content: richContent({
                title: "Variáveis e tipos",
                intro: [
                    "Nesta etapa, vamos trabalhar Variáveis e tipos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Variáveis e tipos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Variáveis e tipos é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l3",
            title: "Operadores e coerção",
            type: "TEXT",
            content: richContent({
                title: "Operadores e coerção",
                intro: [
                    "Nesta etapa, vamos trabalhar Operadores e coerção com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Operadores e coerção",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Operadores e coerção é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l4",
            title: "Condicionais",
            type: "TEXT",
            content: richContent({
                title: "Condicionais",
                intro: [
                    "Nesta etapa, vamos trabalhar Condicionais com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Condicionais",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Condicionais é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l5",
            title: "Loops",
            type: "TEXT",
            content: richContent({
                title: "Loops",
                intro: [
                    "Nesta etapa, vamos trabalhar Loops com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Loops",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Loops é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l6",
            title: "Funções",
            type: "TEXT",
            content: richContent({
                title: "Funções",
                intro: [
                    "Nesta etapa, vamos trabalhar Funções com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Funções",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Funções é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l7",
            title: "Arrays",
            type: "TEXT",
            content: richContent({
                title: "Arrays",
                intro: [
                    "Nesta etapa, vamos trabalhar Arrays com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Arrays",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Arrays é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l8",
            title: "Objetos",
            type: "TEXT",
            content: richContent({
                title: "Objetos",
                intro: [
                    "Nesta etapa, vamos trabalhar Objetos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Objetos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Objetos é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l9",
            title: "Quiz: DOM e fundamentos JavaScript",
            type: "QUIZ",
            questionId: "js1-q1",
            order: 9,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "js1-l10",
            title: "DOM e seletores",
            type: "TEXT",
            content: richContent({
                title: "DOM e seletores",
                intro: [
                    "Nesta etapa, vamos trabalhar DOM e seletores com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de DOM e seletores",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "DOM e seletores é uma etapa importante para avançar na trilha.",
            }),
            order: 10,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l11",
            title: "Eventos",
            type: "TEXT",
            content: richContent({
                title: "Eventos",
                intro: [
                    "Nesta etapa, vamos trabalhar Eventos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Eventos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Eventos é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js1-l12",
            title: "Vídeo JavaScript básico",
            type: "VIDEO",
            content: videoContent(
                "Vídeo JavaScript básico",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            order: 12,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "js1-l13",
            title: "Atividade: Calculadora JS",
            type: "ASSIGNMENT",
            taskId: "js1-tk1",
            order: 13,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "js1-l14",
            title: "Atividade: Lista de tarefas",
            type: "ASSIGNMENT",
            taskId: "js1-tk2",
            order: 14,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "js1-l15",
            title: "Revisão fundamentos",
            type: "TEXT",
            content: richContent({
                title: "Revisão fundamentos",
                intro: [
                    "Nesta etapa, vamos trabalhar Revisão fundamentos com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Revisão fundamentos",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Revisão fundamentos é uma etapa importante para avançar na trilha.",
            }),
            order: 15,
            xp: 90,
            durationMin: 30,
        },
    ],
};

const jsIntermediarioSpec: CourseSeed = {
    id: "js-c2",
    title: "JavaScript Intermediário: APIs e Projetos",
    description:
        "Curso de JavaScript intermediário com assincronismo, fetch, APIs, módulos, LocalStorage e projetos.",
    language: "JavaScript",
    level: "INTERMEDIATE",
    instructor: "Equipe Acadêmica",
    banner: "from-orange-400 to-yellow-500",
    color: "streak",
    questions: [
        {
            id: "js2-q1",
            question:
                "Ao consumir uma API com fetch, por que geralmente usamos async/await?",
            optionA:
                "Para lidar melhor com operações assíncronas sem bloquear a interface",
            optionB: "Para transformar HTML em CSS",
            optionC: "Para remover a necessidade de JSON",
            optionD: "Para impedir tratamento de erros",
            correct: "A",
            explanation:
                "Requisições HTTP levam tempo. async/await deixa o fluxo assíncrono mais legível e facilita tratamento de sucesso e erro.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "js2-tk1",
            title: "Atividade: Projeto consumindo API",
            description: "Pratique Projeto consumindo API com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto consumindo API em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto consumindo API",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "js2-tk2",
            title: "Atividade: Validação de formulário",
            description: "Pratique Validação de formulário com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Validação de formulário em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Validação de formulário",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "js2-tk3",
            title: "Atividade: Projeto final JS",
            description: "Pratique Projeto final JS com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto final JS em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto final JS",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "js2-l1",
            title: "Assincronismo",
            type: "TEXT",
            content: richContent({
                title: "Assincronismo",
                intro: [
                    "Nesta etapa, vamos trabalhar Assincronismo com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Assincronismo",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Assincronismo é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l2",
            title: "Promises",
            type: "TEXT",
            content: richContent({
                title: "Promises",
                intro: [
                    "Nesta etapa, vamos trabalhar Promises com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Promises",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Promises é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l3",
            title: "async e await",
            type: "TEXT",
            content: richContent({
                title: "async e await",
                intro: [
                    "Nesta etapa, vamos trabalhar async e await com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de async e await",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "async e await é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l4",
            title: "fetch e APIs",
            type: "TEXT",
            content: richContent({
                title: "fetch e APIs",
                intro: [
                    "Nesta etapa, vamos trabalhar fetch e APIs com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de fetch e APIs",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "fetch e APIs é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l5",
            title: "JSON na prática",
            type: "TEXT",
            content: richContent({
                title: "JSON na prática",
                intro: [
                    "Nesta etapa, vamos trabalhar JSON na prática com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de JSON na prática",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "JSON na prática é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l6",
            title: "Tratamento de erros",
            type: "TEXT",
            content: richContent({
                title: "Tratamento de erros",
                intro: [
                    "Nesta etapa, vamos trabalhar Tratamento de erros com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Tratamento de erros",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Tratamento de erros é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l7",
            title: "Módulos ES",
            type: "TEXT",
            content: richContent({
                title: "Módulos ES",
                intro: [
                    "Nesta etapa, vamos trabalhar Módulos ES com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Módulos ES",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout: "Módulos ES é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l8",
            title: "Quiz: APIs com fetch",
            type: "QUIZ",
            questionId: "js2-q1",
            order: 8,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "js2-l9",
            title: "LocalStorage avançado",
            type: "TEXT",
            content: richContent({
                title: "LocalStorage avançado",
                intro: [
                    "Nesta etapa, vamos trabalhar LocalStorage avançado com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de LocalStorage avançado",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "LocalStorage avançado é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l10",
            title: "Atividade: Projeto consumindo API",
            type: "ASSIGNMENT",
            taskId: "js2-tk1",
            order: 10,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "js2-l11",
            title: "Organização de código",
            type: "TEXT",
            content: richContent({
                title: "Organização de código",
                intro: [
                    "Nesta etapa, vamos trabalhar Organização de código com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Organização de código",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Organização de código é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l12",
            title: "Vídeo JS avançado",
            type: "VIDEO",
            content: videoContent(
                "Vídeo JS avançado",
                "Vídeo de apoio para complementar o texto com demonstração prática e revisão visual.",
                [
                    "Anote termos e comandos importantes",
                    "Pause e reproduza exemplos",
                    "Use o vídeo para revisar antes do quiz",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            order: 12,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "js2-l13",
            title: "Atividade: Validação de formulário",
            type: "ASSIGNMENT",
            taskId: "js2-tk2",
            order: 13,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "js2-l14",
            title: "Integração com front-end",
            type: "TEXT",
            content: richContent({
                title: "Integração com front-end",
                intro: [
                    "Nesta etapa, vamos trabalhar Integração com front-end com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Integração com front-end",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: jsImg,
                callout:
                    "Integração com front-end é uma etapa importante para avançar na trilha.",
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "js2-l15",
            title: "Atividade: Projeto final JS",
            type: "ASSIGNMENT",
            taskId: "js2-tk3",
            order: 15,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const cFundamentosSpec: CourseSeed = {
    id: "c-c1",
    title: "Linguagem C: Fundamentos",
    description:
        "Curso completo de C com sintaxe, compilação, tipos, controle de fluxo, funções, arrays, strings, ponteiros e structs.",
    language: "C",
    level: "BEGINNER",
    instructor: "Equipe Acadêmica",
    banner: "from-primary to-streak",
    color: "primary",
    questions: [
        {
            id: "c1-q1",
            question:
                "Em C, por que é importante declarar corretamente o tipo de uma variável?",
            optionA:
                "Porque o tipo define tamanho, representação e operações possíveis sobre o valor",
            optionB: "Porque todas as variáveis viram string",
            optionC: "Porque o compilador ignora tipos",
            optionD: "Porque tipos só existem em JavaScript",
            correct: "A",
            explanation:
                "C é uma linguagem fortemente ligada à memória; tipos afetam armazenamento, leitura, escrita e operações.",
            xp: 40,
            difficulty: "BEGINNER",
        },
    ],
    tasks: [
        {
            id: "c1-tk1",
            title: "Atividade: Calculadora em C",
            description: "Pratique Calculadora em C com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Calculadora em C em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Calculadora em C",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "c1-tk2",
            title: "Atividade: Projeto cadastro simples",
            description: "Pratique Projeto cadastro simples com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto cadastro simples em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto cadastro simples",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "c1-l1",
            title: "Introdução à linguagem C",
            type: "TEXT",
            content: richContent({
                title: "Introdução à linguagem C",
                intro: [
                    "Nesta etapa, vamos trabalhar Introdução à linguagem C com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Introdução à linguagem C",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Introdução à linguagem C é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l2",
            title: "Compilação e execução",
            type: "TEXT",
            content: richContent({
                title: "Compilação e execução",
                intro: [
                    "Nesta etapa, vamos trabalhar Compilação e execução com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Compilação e execução",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Compilação e execução é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l3",
            title: "Variáveis e tipos em C",
            type: "TEXT",
            content: richContent({
                title: "Variáveis e tipos em C",
                intro: [
                    "Nesta etapa, vamos trabalhar Variáveis e tipos em C com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Variáveis e tipos em C",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Variáveis e tipos em C é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l4",
            title: "Entrada e saída",
            type: "TEXT",
            content: richContent({
                title: "Entrada e saída",
                intro: [
                    "Nesta etapa, vamos trabalhar Entrada e saída com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Entrada e saída",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Entrada e saída é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l5",
            title: "Condicionais",
            type: "TEXT",
            content: richContent({
                title: "Condicionais",
                intro: [
                    "Nesta etapa, vamos trabalhar Condicionais com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Condicionais",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Condicionais é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l6",
            title: "Laços",
            type: "TEXT",
            content: richContent({
                title: "Laços",
                intro: [
                    "Nesta etapa, vamos trabalhar Laços com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Laços",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Laços é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l7",
            title: "Funções",
            type: "TEXT",
            content: richContent({
                title: "Funções",
                intro: [
                    "Nesta etapa, vamos trabalhar Funções com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Funções",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Funções é uma etapa importante para avançar na trilha.",
            }),
            order: 7,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l8",
            title: "Arrays",
            type: "TEXT",
            content: richContent({
                title: "Arrays",
                intro: [
                    "Nesta etapa, vamos trabalhar Arrays com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Arrays",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Arrays é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l9",
            title: "Strings",
            type: "TEXT",
            content: richContent({
                title: "Strings",
                intro: [
                    "Nesta etapa, vamos trabalhar Strings com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Strings",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Strings é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l10",
            title: "Quiz: Tipos e variáveis em C",
            type: "QUIZ",
            questionId: "c1-q1",
            order: 10,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "c1-l11",
            title: "Ponteiros introdução",
            type: "TEXT",
            content: richContent({
                title: "Ponteiros introdução",
                intro: [
                    "Nesta etapa, vamos trabalhar Ponteiros introdução com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Ponteiros introdução",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Ponteiros introdução é uma etapa importante para avançar na trilha.",
            }),
            order: 11,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l12",
            title: "Structs",
            type: "TEXT",
            content: richContent({
                title: "Structs",
                intro: [
                    "Nesta etapa, vamos trabalhar Structs com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Structs",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Structs é uma etapa importante para avançar na trilha.",
            }),
            order: 12,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c1-l13",
            title: "Vídeo: primeiros passos em C",
            type: "VIDEO",
            content: videoContent(
                "Primeiros passos em C",
                "Vídeo em português para revisar compilação, estrutura de um programa, função main, entrada, saída e primeiros exercícios em C.",
                [
                    "Observe a estrutura mínima do programa",
                    "Reproduza o exemplo no compilador",
                    "Anote erros de sintaxe comuns",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=FH7YrE0RjWE",
            order: 13,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "c1-l14",
            title: "Atividade: Calculadora em C",
            type: "ASSIGNMENT",
            taskId: "c1-tk1",
            order: 14,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "c1-l15",
            title: "Atividade: Projeto cadastro simples",
            type: "ASSIGNMENT",
            taskId: "c1-tk2",
            order: 15,
            xp: 220,
            durationMin: 90,
        },
    ],
};

const cIntermediarioSpec: CourseSeed = {
    id: "c-c2",
    title: "Linguagem C: Memória, Ponteiros e Modularização",
    description:
        "Curso intermediário de C com ponteiros, memória dinâmica, arquivos, modularização, TAD e estruturas dinâmicas.",
    language: "C",
    level: "INTERMEDIATE",
    instructor: "Equipe Acadêmica",
    banner: "from-streak to-primary",
    color: "streak",
    questions: [
        {
            id: "c2-q1",
            question: "Qual é a responsabilidade do programador ao usar malloc em C?",
            optionA: "Liberar a memória com free quando ela não for mais necessária",
            optionB: "Nunca verificar ponteiros",
            optionC: "Usar malloc apenas com int",
            optionD: "Apagar o sistema operacional",
            correct: "A",
            explanation:
                "Alocação dinâmica exige cuidado: memória obtida com malloc deve ser liberada para evitar vazamentos.",
            xp: 40,
            difficulty: "INTERMEDIATE",
        },
    ],
    tasks: [
        {
            id: "c2-tk1",
            title: "Atividade: Lista dinâmica em C",
            description: "Pratique Lista dinâmica em C com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Lista dinâmica em C em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Lista dinâmica em C",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "c2-tk2",
            title: "Atividade: Pilha dinâmica",
            description: "Pratique Pilha dinâmica com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Pilha dinâmica em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Pilha dinâmica",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "c2-tk3",
            title: "Atividade: Fila dinâmica",
            description: "Pratique Fila dinâmica com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Fila dinâmica em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Fila dinâmica",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
        {
            id: "c2-tk4",
            title: "Atividade: Projeto final C",
            description: "Pratique Projeto final C com um exercício guiado.",
            objective:
                "Aplicar o conteúdo de Projeto final C em um entregável prático.",
            xp: 220,
            estimatedTime: "90 min",
            requirements: [
                "Explicar o objetivo de Projeto final C",
                "Criar um exemplo funcional",
                "Testar o resultado",
                "Registrar dificuldades encontradas",
                "Entregar código ou relatório",
            ],
        },
    ],
    lessons: [
        {
            id: "c2-l1",
            title: "Ponteiros avançados",
            type: "TEXT",
            content: richContent({
                title: "Ponteiros avançados",
                intro: [
                    "Nesta etapa, vamos trabalhar Ponteiros avançados com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Ponteiros avançados",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Ponteiros avançados é uma etapa importante para avançar na trilha.",
            }),
            order: 1,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l2",
            title: "Alocação dinâmica",
            type: "TEXT",
            content: richContent({
                title: "Alocação dinâmica",
                intro: [
                    "Nesta etapa, vamos trabalhar Alocação dinâmica com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Alocação dinâmica",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Alocação dinâmica é uma etapa importante para avançar na trilha.",
            }),
            order: 2,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l3",
            title: "malloc, calloc e free",
            type: "TEXT",
            content: richContent({
                title: "malloc, calloc e free",
                intro: [
                    "Nesta etapa, vamos trabalhar malloc, calloc e free com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de malloc, calloc e free",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "malloc, calloc e free é uma etapa importante para avançar na trilha.",
            }),
            order: 3,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l4",
            title: "Arquivos em C",
            type: "TEXT",
            content: richContent({
                title: "Arquivos em C",
                intro: [
                    "Nesta etapa, vamos trabalhar Arquivos em C com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Arquivos em C",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Arquivos em C é uma etapa importante para avançar na trilha.",
            }),
            order: 4,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l5",
            title: "Modularização .h e .c",
            type: "TEXT",
            content: richContent({
                title: "Modularização .h e .c",
                intro: [
                    "Nesta etapa, vamos trabalhar Modularização .h e .c com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Modularização .h e .c",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Modularização .h e .c é uma etapa importante para avançar na trilha.",
            }),
            order: 5,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l6",
            title: "TAD em C",
            type: "TEXT",
            content: richContent({
                title: "TAD em C",
                intro: [
                    "Nesta etapa, vamos trabalhar TAD em C com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de TAD em C",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "TAD em C é uma etapa importante para avançar na trilha.",
            }),
            order: 6,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l7",
            title: "Quiz: Memória dinâmica em C",
            type: "QUIZ",
            questionId: "c2-q1",
            order: 7,
            xp: 40,
            durationMin: 5,
        },
        {
            id: "c2-l8",
            title: "Depuração",
            type: "TEXT",
            content: richContent({
                title: "Depuração",
                intro: [
                    "Nesta etapa, vamos trabalhar Depuração com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Depuração",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Depuração é uma etapa importante para avançar na trilha.",
            }),
            order: 8,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l9",
            title: "Boas práticas",
            type: "TEXT",
            content: richContent({
                title: "Boas práticas",
                intro: [
                    "Nesta etapa, vamos trabalhar Boas práticas com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Boas práticas",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout: "Boas práticas é uma etapa importante para avançar na trilha.",
            }),
            order: 9,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l10",
            title: "Vídeo: malloc e alocação dinâmica",
            type: "VIDEO",
            content: videoContent(
                "malloc e alocação dinâmica",
                "Vídeo em português para revisar memória dinâmica, ponteiros, sizeof, malloc e a responsabilidade de liberar memória com free.",
                [
                    "Identifique o retorno de malloc",
                    "Veja como sizeof evita erro de tamanho",
                    "Anote quando usar free",
                ]
            ),
            videoUrl: "https://www.youtube.com/watch?v=iU9CL5d-P5U",
            order: 10,
            xp: 70,
            durationMin: 25,
        },
        {
            id: "c2-l11",
            title: "Atividade: Lista dinâmica em C",
            type: "ASSIGNMENT",
            taskId: "c2-tk1",
            order: 11,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "c2-l12",
            title: "Atividade: Pilha dinâmica",
            type: "ASSIGNMENT",
            taskId: "c2-tk2",
            order: 12,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "c2-l13",
            title: "Atividade: Fila dinâmica",
            type: "ASSIGNMENT",
            taskId: "c2-tk3",
            order: 13,
            xp: 220,
            durationMin: 90,
        },
        {
            id: "c2-l14",
            title: "Projeto modular",
            type: "TEXT",
            content: richContent({
                title: "Projeto modular",
                intro: [
                    "Nesta etapa, vamos trabalhar Projeto modular com foco em uso real, leitura dos slides e prática guiada.",
                    "A ideia é sair da definição decorada e entender como esse assunto aparece em código, projeto, terminal ou arquitetura.",
                    "Leia, execute os exemplos quando houver comando ou código, e anote onde você teria dificuldade de explicar para outra pessoa.",
                ],
                bullets: [
                    "Conceito central de Projeto modular",
                    "Onde isso aparece em projetos reais",
                    "Cuidados, armadilhas e boas práticas",
                    "Conexão com o conteúdo anterior",
                ],
                image: cImg,
                callout:
                    "Projeto modular é uma etapa importante para avançar na trilha.",
            }),
            order: 14,
            xp: 90,
            durationMin: 30,
        },
        {
            id: "c2-l15",
            title: "Atividade: Projeto final C",
            type: "ASSIGNMENT",
            taskId: "c2-tk4",
            order: 15,
            xp: 220,
            durationMin: 90,
        },
    ],
};

async function main() {
    const user = await prisma.user.findUnique({ where: { email: emailToReset } });

    if (user) {
        await prisma.userQuestionProgress.deleteMany({
            where: { userId: user.id },
        });
        await prisma.userTaskProgress.deleteMany({ where: { userId: user.id } });
        await prisma.userAchievement.deleteMany({ where: { userId: user.id } });
        await prisma.userLessonProgress.deleteMany({ where: { userId: user.id } });
        await prisma.userCourseProgress.deleteMany({ where: { userId: user.id } });
        await prisma.user.update({
            where: { id: user.id },
            data: {
                xp: 0,
                level: 1,
                streak: 0,
                completedCourses: 0,
                lastStudyDate: null,
            },
        });
        console.log(`Progresso resetado para ${emailToReset}`);
    } else {
        console.warn(
            `Usuário não encontrado para reset: ${emailToReset}. Continuando seed dos conteúdos.`
        );
    }

    await prisma.userQuestionProgress.deleteMany();
    await prisma.userTaskProgress.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.userLessonProgress.deleteMany();
    await prisma.userCourseProgress.deleteMany();

    await prisma.trailCourse.deleteMany();
    await prisma.question.deleteMany();
    await prisma.task.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.trail.deleteMany();
    await prisma.course.deleteMany();

    const created: Record<string, { id: string; xp: number; minutes: number }> =
        {};
    created[edFundamentosSpec.id] = await createFullCourse(edFundamentosSpec);
    created[edIntermediarioSpec.id] = await createFullCourse(edIntermediarioSpec);
    created[edAvancadoSpec.id] = await createFullCourse(edAvancadoSpec);
    created[webFundamentosSpec.id] = await createFullCourse(webFundamentosSpec);
    created[webFrontendSpec.id] = await createFullCourse(webFrontendSpec);
    created[webBackendSpec.id] = await createFullCourse(webBackendSpec);
    created[soFundamentosSpec.id] = await createFullCourse(soFundamentosSpec);
    created[soProcessosSpec.id] = await createFullCourse(soProcessosSpec);
    created[soLinuxSpec.id] = await createFullCourse(soLinuxSpec);
    created[jsEssencialSpec.id] = await createFullCourse(jsEssencialSpec);
    created[jsIntermediarioSpec.id] = await createFullCourse(jsIntermediarioSpec);
    created[cFundamentosSpec.id] = await createFullCourse(cFundamentosSpec);
    created[cIntermediarioSpec.id] = await createFullCourse(cIntermediarioSpec);

    await createTrail({
        id: "ed-trilha-1",
        name: "Estrutura de Dados Completa",
        description:
            "Do TAD ao avançado: listas, pilhas, filas, árvores, ABB, AVL, grafos, BFS e DFS.",
        level: "ADVANCED",
        color: "primary",
        icon: "Network",
        courses: [
            { courseId: "ed-c1", order: 1, xp: created["ed-c1"].xp },
            { courseId: "ed-c2", order: 2, xp: created["ed-c2"].xp },
            { courseId: "ed-c3", order: 3, xp: created["ed-c3"].xp },
        ],
    });

    await createTrail({
        id: "web-trilha-1",
        name: "Desenvolvimento Web Completo",
        description:
            "Planejamento, HTML, CSS, JavaScript, front-end moderno, back-end, APIs REST, testes e deploy.",
        level: "INTERMEDIATE",
        color: "success",
        icon: "Globe",
        courses: [
            { courseId: "web-c1", order: 1, xp: created["web-c1"].xp },
            { courseId: "web-c2", order: 2, xp: created["web-c2"].xp },
            { courseId: "web-c3", order: 3, xp: created["web-c3"].xp },
        ],
    });

    await createTrail({
        id: "so-trilha-1",
        name: "Sistemas Operacionais Completo",
        description:
            "Fundamentos, evolução, kernel, concorrência, processos, Linux, shell e administração básica.",
        level: "ADVANCED",
        color: "secondary",
        icon: "Cpu",
        courses: [
            { courseId: "so-c1", order: 1, xp: created["so-c1"].xp },
            { courseId: "so-c2", order: 2, xp: created["so-c2"].xp },
            { courseId: "so-c3", order: 3, xp: created["so-c3"].xp },
        ],
    });

    // Trilha criada para demonstrar reaproveitamento: usa cursos próprios e também cursos da trilha Web.
    await createTrail({
        id: "js-trilha-1",
        name: "JavaScript Completo",
        description:
            "JavaScript puro, APIs, projetos e front-end moderno reaproveitando cursos já presentes na trilha de Desenvolvimento Web.",
        level: "INTERMEDIATE",
        color: "accent",
        icon: "Code2",
        courses: [
            { courseId: "js-c1", order: 1, xp: created["js-c1"].xp },
            { courseId: "js-c2", order: 2, xp: created["js-c2"].xp },
            { courseId: "web-c2", order: 3, xp: created["web-c2"].xp },
            { courseId: "web-c3", order: 4, xp: created["web-c3"].xp },
        ],
    });

    // Trilha criada para demonstrar reaproveitamento: usa cursos próprios de C e cursos da trilha de Estrutura de Dados.
    await createTrail({
        id: "c-trilha-1",
        name: "Linguagem C e Estruturas",
        description:
            "C do básico ao intermediário, ponteiros, memória, TAD e reaproveitamento dos cursos de Estrutura de Dados.",
        level: "ADVANCED",
        color: "streak",
        icon: "Terminal",
        courses: [
            { courseId: "c-c1", order: 1, xp: created["c-c1"].xp },
            { courseId: "c-c2", order: 2, xp: created["c-c2"].xp },
            { courseId: "ed-c1", order: 3, xp: created["ed-c1"].xp },
            { courseId: "ed-c2", order: 4, xp: created["ed-c2"].xp },
            { courseId: "ed-c3", order: 5, xp: created["ed-c3"].xp },
        ],
    });

    console.log("Seed completo criado com sucesso.");
    console.log("Cursos criados:", Object.keys(created).length);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
