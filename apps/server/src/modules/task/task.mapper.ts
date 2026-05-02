export function taskToResponse(task: any) {
    const progress = task.progress?.[0];

    return {
        id: task.id,
        courseId: task.courseId,
        title: task.title,
        description: task.description,
        objective: task.objective,
        xp: task.xp,
        estimatedTime: task.estimatedTime,
        requirements: task.requirements,
        completed: progress?.completed ?? false,
        answer: progress?.answer ?? "",
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
}