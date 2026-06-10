import recipesData from "@/data/countdown-recipes.json";
import { generateCountdownId, generatePlanId } from "@/lib/countdown/id-utils";
import { getTodayDateString } from "@/lib/task-utils";
import type {
  CountdownRecipe,
  CountdownTarget,
  PlanBlueprint,
} from "@/types/countdown";

const recipes = recipesData as CountdownRecipe[];

export function getRecipes(includeHidden = false): CountdownRecipe[] {
  return recipes.filter((r) => includeHidden || !r.hidden);
}

export function getRecipeById(id: string): CountdownRecipe | undefined {
  return recipes.find((r) => r.id === id);
}

/** 从 Recipe 创建倒计时目标 */
export function applyRecipe(
  recipeId: string,
  options: {
    title: string;
    targetDate: string;
    startDate?: string;
  }
): CountdownTarget | null {
  const recipe = getRecipeById(recipeId);
  if (!recipe) return null;

  const now = new Date().toISOString();
  const plans: PlanBlueprint[] = recipe.defaultPlans.map((p) => ({
    ...p,
    id: generatePlanId(),
    params: { ...p.params },
  }));

  return {
    id: generateCountdownId(),
    title: options.title,
    targetDate: options.targetDate,
    startDate: options.startDate ?? getTodayDateString(),
    status: "draft",
    recipeId: recipe.id,
    plans,
    generateHorizonDays: 14,
    createdAt: now,
    updatedAt: now,
  };
}

/** 创建空白倒计时 */
export function createEmptyTarget(title: string, targetDate: string): CountdownTarget {
  const now = new Date().toISOString();
  return {
    id: generateCountdownId(),
    title,
    targetDate,
    startDate: getTodayDateString(),
    status: "draft",
    plans: [],
    generateHorizonDays: 14,
    createdAt: now,
    updatedAt: now,
  };
}
