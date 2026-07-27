import type { Activity } from "@helpsenior/core";

export interface ActivitySummary {
  total: number;
  pending: number;
  completed: number;
  withDate: number;
}

function findByTitle(activity: Activity, term: string[]): Activity | null {
  const matches = term.filter((word) => activity.title.toLocaleLowerCase().includes(word));
  return matches.length > 0 ? activity : null;
}

function findByDescription(activity: Activity, term: string[]): Activity | null {
  if (!activity.description) {
    return null;
  }

  const matches = term.filter((word) => activity.description?.toLocaleLowerCase().includes(word));
  return matches.length > 0 ? activity : null;
}

function findBySteps(activity: Activity, term: string[]): Activity | null {
  const stepMatches = activity.steps.filter((step) => {
    const descriptionMatches = term.filter((word) => step.description.toLocaleLowerCase().includes(word));

    return descriptionMatches.length > 0;
  });

  return stepMatches.length > 0 ? activity : null;
}

export function filterActivities(activities: Activity[], filter: string): Activity[] {
  const normalizedFilter = filter.trim().toLocaleLowerCase();

  if (!normalizedFilter || normalizedFilter === "all") {
    return activities;
  }

  const searchTerms = normalizedFilter.split(/\s+/);

  const titleMatches = activities.filter((activity) => findByTitle(activity, searchTerms));
  const descriptionMatches = activities.filter((activity) => findByDescription(activity, searchTerms));
  const stepsMatches = activities.filter((activity) => findBySteps(activity, searchTerms));

  const filteredActivities = [...new Set([...titleMatches, ...descriptionMatches, ...stepsMatches])];

  return filteredActivities;
}
