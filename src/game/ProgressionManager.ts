import { ResourceType, SKILLS } from './ResourceTypes';

export interface ProgressionData {
  inventory: Record<ResourceType, number>;
  skills: Record<string, number>;
  consumables: Record<string, number>;
}

const INITIAL_PROGRESSION: ProgressionData = {
  inventory: {
    scrap: 0,
    plasma: 0,
    alloy: 0,
    flux: 0,
    neural_core: 0
  },
  skills: {},
  consumables: {
    repair_kit: 0,
    emp_generator: 0,
    overdrive_chip: 0
  }
};

export class ProgressionManager {
  private static data: ProgressionData = ProgressionManager.load();

  private static load(): ProgressionData {
    const saved = localStorage.getItem('nexus_progression');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_PROGRESSION,
        ...parsed,
        inventory: { ...INITIAL_PROGRESSION.inventory, ...parsed.inventory },
        skills: { ...INITIAL_PROGRESSION.skills, ...parsed.skills },
        consumables: { ...INITIAL_PROGRESSION.consumables, ...parsed.consumables }
      };
    }
    return { ...INITIAL_PROGRESSION };
  }

  static getData(): ProgressionData {
    return { ...this.data };
  }

  private static listeners: Set<() => void> = new Set();

  static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private static notify() {
    this.listeners.forEach(l => l());
  }

  static setData(newData: ProgressionData) {
    this.data = { ...newData };
    this.save();
    this.notify();
  }

  static addResource(type: ResourceType, amount: number) {
    this.data.inventory[type] = (this.data.inventory[type] || 0) + amount;
    this.save();
    this.notify();
  }

  static spendResources(requirements: Partial<Record<ResourceType, number>>): boolean {
    // Check if we have enough
    for (const [res, amount] of Object.entries(requirements)) {
      if ((this.data.inventory[res as ResourceType] || 0) < (amount || 0)) {
        return false;
      }
    }

    // Spend
    for (const [res, amount] of Object.entries(requirements)) {
      this.data.inventory[res as ResourceType] -= (amount || 0);
    }
    this.save();
    this.notify();
    return true;
  }

  static upgradeSkill(skillId: string): boolean {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return false;

    const currentLevel = this.data.skills[skillId] || 0;
    if (currentLevel >= skill.maxLevel) return false;

    const cost = skill.costPerLevel(currentLevel);
    if (this.spendResources(cost)) {
      this.data.skills[skillId] = currentLevel + 1;
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  static craftItem(recipeId: string, ingredients: Partial<Record<ResourceType, number>>): boolean {
    if (this.spendResources(ingredients)) {
      this.data.consumables[recipeId] = (this.data.consumables[recipeId] || 0) + 1;
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  static useConsumable(id: string): boolean {
    if ((this.data.consumables[id] || 0) > 0) {
      this.data.consumables[id] -= 1;
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  static getSkillLevel(skillId: string): number {
    return this.data.skills[skillId] || 0;
  }

  static getSkillBonus(skillId: string): number {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return 0;
    return skill.effect(this.getSkillLevel(skillId));
  }

  private static save() {
    localStorage.setItem('nexus_progression', JSON.stringify(this.data));
  }
}
