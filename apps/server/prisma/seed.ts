import { ChallengeType } from "@prisma/client";
import { prisma } from "../src/lib/prisma.js";


async function main() {
  console.log("Limpando banco de dados...");
  // Opcional: limpa dados antigos para evitar duplicatas ao rodar novamente
  await prisma.course.deleteMany();

  console.log("Populando cursos...");

  // --- CURSO DE PYTHON ---
  await prisma.course.create({
    data: {
      id: "python-1",
      title: "Python para Iniciantes",
      imageSrc: "/icons/python.svg",
      units: {
        create: {
          title: "Unidade 1",
          description: "Fundamentos e Print",
          order: 1,
          lessons: {
            create: {
              title: "Primeiros Passos",
              order: 1,
              challenges: {
                create: [
                  {
                    type: ChallengeType.SELECT,
                    question: "Qual função é usada para imprimir algo no console em Python?",
                    order: 1,
                    options: {
                      create: [
                        { text: "print()", isCorrect: true },
                        { text: "echo()", isCorrect: false },
                        { text: "System.out.println()", isCorrect: false }
                      ]
                    }
                  },
                  {
                    type: ChallengeType.ORDER,
                    question: "Ordene os blocos para exibir 'Olá':",
                    order: 2,
                    options: {
                      create: [
                        { text: "print", isCorrect: true, order: 1 },
                        { text: "('Olá')", isCorrect: true, order: 2 }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  });

  // --- CURSO DE JAVA ---
  await prisma.course.create({
    data: {
      id: "java-1",
      title: "Java Moderno",
      imageSrc: "/icons/java.svg",
      units: {
        create: {
          title: "Unidade 1",
          description: "Sintaxe e Estrutura",
          order: 1,
          lessons: {
            create: {
              title: "A classe Main",
              order: 1,
              challenges: {
                create: {
                  type: ChallengeType.ASSIST,
                  question: "Em Java, qual palavra-chave indica que um método pertence à classe e não a uma instância?",
                  order: 1,
                  options: {
                    create: [
                      { text: "static", isCorrect: true },
                      { text: "final", isCorrect: false },
                      { text: "void", isCorrect: false }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // --- CURSO DE C ---
  await prisma.course.create({
    data: {
      id: "c-1",
      title: "Linguagem C",
      imageSrc: "/icons/c.svg",
      units: {
        create: {
          title: "Unidade 1",
          description: "Variáveis e Tipos",
          order: 1,
          lessons: {
            create: {
              title: "Inteiros e Floats",
              order: 1,
              challenges: {
                create: {
                  type: ChallengeType.SELECT,
                  question: "Qual tipo de dado ocupa geralmente 4 bytes e armazena números inteiros?",
                  order: 1,
                  options: {
                    create: [
                      { text: "int", isCorrect: true },
                      { text: "char", isCorrect: false },
                      { text: "double", isCorrect: false }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  });