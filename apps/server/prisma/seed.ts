import { prisma } from "../src/lib/prisma";

async function main() {
    await prisma.userAchievement.deleteMany();
    await prisma.userLessonProgress.deleteMany();
    await prisma.userCourseProgress.deleteMany();
    await prisma.userTaskProgress.deleteMany();
    await prisma.trailCourse.deleteMany();
    await prisma.question.deleteMany();
    await prisma.task.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.trail.deleteMany();
    await prisma.course.deleteMany();

    const c1 = await prisma.course.create({
        data: {
            id: "c1",
            title: "TypeScript do Zero",
            description:
                "Aprenda TypeScript desde os fundamentos até features avançadas como generics e tipos condicionais.",
            language: "TypeScript",
            level: "BEGINNER",
            duration: "8h",
            xp: 800,
            instructor: "Marina Costa",
            banner: "from-secondary to-primary",
            color: "secondary",
            status: "PUBLISHED",
        },
    });

    const c2 = await prisma.course.create({
        data: {
            id: "c2",
            title: "Algoritmos e Lógica",
            description:
                "Domine pensamento computacional com exercícios práticos e desafios reais.",
            language: "Algoritmos",
            level: "BEGINNER",
            duration: "12h",
            xp: 1200,
            instructor: "Rafael Lima",
            banner: "from-accent to-streak",
            color: "accent",
            status: "PUBLISHED",
        },
    });

    const c3 = await prisma.course.create({
        data: {
            id: "c3",
            title: "Java Essencial",
            description:
                "Programação orientada a objetos com Java moderno, do iniciante ao intermediário.",
            language: "Java",
            level: "INTERMEDIATE",
            duration: "15h",
            xp: 1500,
            instructor: "Pedro Henrique",
            banner: "from-streak to-accent",
            color: "streak",
            status: "PUBLISHED",
        },
    });

    const c4 = await prisma.course.create({
        data: {
            id: "c4",
            title: "Linguagem C na prática",
            description:
                "Entenda ponteiros, memória e estruturas com a linguagem mais influente do mundo.",
            language: "C",
            level: "ADVANCED",
            duration: "20h",
            xp: 2000,
            instructor: "Beatriz Almeida",
            banner: "from-primary to-secondary",
            color: "primary",
            status: "PUBLISHED",
        },
    });

    const c5 = await prisma.course.create({
        data: {
            id: "c5",
            title: "Desenvolvimento Web",
            description:
                "HTML, CSS e JavaScript modernos para construir sites incríveis e responsivos.",
            language: "Web",
            level: "BEGINNER",
            duration: "10h",
            xp: 1000,
            instructor: "Carolina Souza",
            banner: "from-success to-secondary",
            color: "success",
            status: "PUBLISHED",
        },
    });

    const c6 = await prisma.course.create({
        data: {
            id: "c6",
            title: "Fundamentos da Programação",
            description:
                "O ponto de partida ideal: variáveis, condicionais, laços e funções.",
            language: "Algoritmos",
            level: "BEGINNER",
            duration: "6h",
            xp: 600,
            instructor: "Marina Costa",
            banner: "from-primary-glow to-primary",
            color: "primary",
            status: "PUBLISHED",
        },
    });

    await prisma.trail.create({
        data: {
            id: "t1",
            name: "Fundamentos da Programação",
            description:
                "A trilha perfeita para quem está começando do zero na programação.",
            level: "BEGINNER",
            totalXp: 2600,
            progress: 52,
            status: "PUBLISHED",
            color: "primary",
            icon: "Sparkles",
            courses: {
                create: [
                    { courseId: c6.id, order: 1 },
                    { courseId: c2.id, order: 2 },
                    { courseId: c1.id, order: 3 },
                ],
            },
        },
    });

    await prisma.trail.create({
        data: {
            id: "t2",
            name: "Web Developer",
            description: "Da base do HTML ao TypeScript em projetos reais.",
            level: "INTERMEDIATE",
            totalXp: 1800,
            progress: 70,
            status: "PUBLISHED",
            color: "secondary",
            icon: "Globe",
            courses: {
                create: [
                    { courseId: c5.id, order: 1 },
                    { courseId: c1.id, order: 2 },
                ],
            },
        },
    });

    await prisma.trail.create({
        data: {
            id: "t3",
            name: "Pensamento Computacional",
            description: "Algoritmos, estruturas e linguagens de baixo nível.",
            level: "ADVANCED",
            totalXp: 4700,
            progress: 28,
            status: "PUBLISHED",
            color: "accent",
            icon: "Brain",
            courses: {
                create: [
                    { courseId: c2.id, order: 1 },
                    { courseId: c4.id, order: 2 },
                    { courseId: c3.id, order: 3 },
                ],
            },
        },
    });

    await prisma.question.createMany({
        data: [
            {
                id: "q1",
                courseId: "c1",
                question: "Qual tipo representa texto em TypeScript?",
                optionA: "number",
                optionB: "string",
                optionC: "boolean",
                optionD: "object",
                correct: "B",
                explanation: "string é o tipo usado para textos.",
                xp: 30,
                difficulty: "BEGINNER",
            },
            {
                id: "q2",
                courseId: "c1",
                question: "Qual estrutura usamos para repetir uma ação?",
                optionA: "if",
                optionB: "switch",
                optionC: "for",
                optionD: "return",
                correct: "C",
                explanation: "for é uma estrutura de repetição.",
                xp: 30,
                difficulty: "BEGINNER",
            },
            {
                id: "q3",
                courseId: "c2",
                question: "O que é uma variável?",
                optionA: "Um espaço para armazenar dados",
                optionB: "Um tipo de função",
                optionC: "Um operador matemático",
                optionD: "Um arquivo do sistema",
                correct: "A",
                explanation: "Variáveis armazenam valores na memória.",
                xp: 25,
                difficulty: "BEGINNER",
            },
            {
                id: "q4",
                courseId: "c4",
                question: "Qual linguagem é compilada: C ou JavaScript?",
                optionA: "JavaScript",
                optionB: "C",
                optionC: "As duas",
                optionD: "Nenhuma",
                correct: "B",
                explanation: "C é compilada; JS é interpretada.",
                xp: 40,
                difficulty: "INTERMEDIATE",
            },
        ],
    });

    await prisma.task.createMany({
        data: [
            {
                id: "tk1",
                courseId: "c1",
                title: "Criando sua primeira função tipada",
                description:
                    "Pratique a criação de funções com parâmetros e retorno tipados.",
                objective: "Implementar a função somar(a: number, b: number): number",
                xp: 120,
                estimatedTime: "15 min",
                requirements: [
                    "A função deve retornar um número",
                    "Os parâmetros devem ser tipados",
                    "O retorno deve ser tipado",
                ],
            },
            {
                id: "tk2",
                courseId: "c2",
                title: "Loop de Fibonacci",
                description:
                    "Imprima os 10 primeiros números da sequência de Fibonacci.",
                objective: "Usar uma estrutura de repetição",
                xp: 150,
                estimatedTime: "20 min",
                requirements: [
                    "Usar for ou while",
                    "Imprimir 10 números",
                    "Não usar recursão",
                ],
            },
        ],
    });

    await prisma.lesson.createMany({
        data: [
            {
                id: "l1",
                courseId: "c1",
                title: "Boas-vindas ao TypeScript",
                type: "TEXT",
                content:
                    "TypeScript é um superset de JavaScript que adiciona tipagem estática.\n\nIsso ajuda você a evitar bugs e escrever código mais confiável.",
                order: 1,
                xp: 30,
                durationMin: 5,
            },
            {
                id: "l2",
                courseId: "c1",
                title: "Tipos primitivos",
                type: "TEXT",
                content:
                    "Os tipos básicos são string, number, boolean, null e undefined.\n\nExemplo:\nlet name: string = 'Lucas';\nlet idade: number = 18;",
                order: 2,
                xp: 40,
                durationMin: 8,
            },
            {
                id: "l3",
                courseId: "c1",
                title: "Funções tipadas",
                type: "VIDEO",
                content: "Aprenda a tipar parâmetros e retornos.",
                videoUrl: "https://www.youtube.com/watch?v=m5YwmzbjszY",
                order: 3,
                xp: 50,
                durationMin: 12,
            },
            {
                id: "l4",
                courseId: "c1",
                title: "Quiz: tipos básicos",
                type: "QUIZ",
                content: "Quiz sobre tipos.",
                order: 4,
                xp: 80,
                durationMin: 6,
                questionId: "q2",
            },
            {
                id: "l5",
                courseId: "c1",
                title: "Tarefa: criando uma função",
                type: "ASSIGNMENT",
                content: "Crie uma função somar que recebe dois números.",
                order: 5,
                xp: 100,
                durationMin: 15,
                taskId: "tk2",
            },
            {
                id: "l6",
                courseId: "c2",
                title: "O que é um algoritmo?",
                type: "TEXT",
                content:
                    "Um algoritmo é uma sequência finita de instruções para resolver um problema.",
                order: 1,
                xp: 30,
                durationMin: 5,
            },
            {
                id: "l7",
                courseId: "c2",
                title: "Estruturas de repetição",
                type: "VIDEO",
                content: "for, while e do-while.",
                order: 2,
                xp: 50,
                durationMin: 10,
            },
        ],
    });

    await prisma.achievement.createMany({
        data: [
            {
                id: "a1",
                name: "Primeiro Código",
                description: "Conclua sua primeira aula",
                icon: "Code2",
                criterion: "1 aula concluída",
                xpBonus: 50,
                status: "PUBLISHED",
            },
            {
                id: "a2",
                name: "Mestre dos Algoritmos",
                description: "Conclua 10 desafios de algoritmos",
                icon: "Brain",
                criterion: "10 quizzes corretos",
                xpBonus: 200,
                status: "PUBLISHED",
            },
            {
                id: "a3",
                name: "Sequência de 7 dias",
                description: "Mantenha uma streak de 7 dias",
                icon: "Flame",
                criterion: "Streak de 7",
                xpBonus: 150,
                status: "PUBLISHED",
            },
            {
                id: "a4",
                name: "Explorador TypeScript",
                description: "Conclua o curso de TypeScript",
                icon: "Compass",
                criterion: "1 curso concluído",
                xpBonus: 300,
                status: "PUBLISHED",
            },
            {
                id: "a5",
                name: "Caçador de Bugs",
                description: "Acerte 20 questões seguidas",
                icon: "Bug",
                criterion: "20 acertos consecutivos",
                xpBonus: 180,
                status: "PUBLISHED",
            },
            {
                id: "a6",
                name: "Maratonista",
                description: "Estude 2 horas em um único dia",
                icon: "Trophy",
                criterion: "1 tarefa concluída",
                xpBonus: 100,
                status: "PUBLISHED",
            },
        ],
    });

    // await prisma.userLessonProgress.createMany({
    //     data: [
    //         {
    //             userId: user.id,
    //             lessonId: "l1",
    //             completed: true,
    //         },
    //         {
    //             userId: user.id,
    //             lessonId: "l2",
    //             completed: true,
    //         },
    //         {
    //             userId: user.id,
    //             lessonId: "l6",
    //             completed: true,
    //         },
    //         {
    //             userId: user.id,
    //             lessonId: "l7",
    //             completed: true,
    //         },
    //     ],
    // });

    // await prisma.userCourseProgress.createMany({
    //     data: [
    //         {
    //             userId: user.id,
    //             courseId: "c1",
    //             progress: 45,
    //             completed: false,
    //         },
    //         {
    //             userId: user.id,
    //             courseId: "c2",
    //             progress: 80,
    //             completed: false,
    //         },
    //         {
    //             userId: user.id,
    //             courseId: "c5",
    //             progress: 100,
    //             completed: true,
    //         },
    //     ],
    // });

    console.log("Seed concluído com sucesso!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
