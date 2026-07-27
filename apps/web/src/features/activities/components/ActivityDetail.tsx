import { useMemo, useState } from "react";

import { Badge, classNames } from "../../../shared/ui";
import type { Activity } from "@helpsenior/core";

interface ActivityDetailProps {
  activity: Activity,
  isLoading: boolean,
}

export function ActivityDetail({
  activity,
  isLoading,
}: ActivityDetailProps) {
  const [step, setStep] = useState(activity.steps[0]);
  const [first, setFirst] = useState(false);
  const [last, setLast] = useState(false);
  
  useMemo(() => {
    setFirst(step.order === 1);
    setLast(step.order === activity.steps.length);
  }, [step]);

  if (isLoading) {
    return (
      <p className="mt-6 text-base font-bold text-slate-600">
        Carregando Atividade...
      </p>
    );
  }

  return (
    <>
    <div>
      <h2 id="activities-title" className="m-0 text-[28px] font-bold">
        {activity.title}
      </h2>

      { activity.description && (
        <p className="simple-mode-secondary mt-2 text-base font-bold leading-6 text-slate-500">
          {activity.description}
        </p>
      )}
    </div>
    <div className={classNames(`mt-3 grid grid-cols-2 gap-6 overflow-y-auto`)}>
      <div className="mt-6">
        { activity.steps.map((step) => (
          <div key={step.order} className="mt-3 rounded-2xl border p-2 w-4/5">
            <p className="simple-mode-secondary mt-2 text-base leading-6 text-slate-500">Passo {step.order}</p>
            <p className="m-0 text-lg text-slate-950">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        <h2 className="m-0 text-lg font-bold text-slate-950 text-center">Etapa Atual</h2>

        { !(first && last) && (
          <div className={classNames(`mt-5 text-center ${first ? "invisible" : ""}`)}>
            <Badge tone="blue" className="cursor-pointer" onClick={() => setStep(activity.steps[step.order - 2])}>
              Voltar
            </Badge>
          </div>
        )}

        <h3 className="m-2 mt-4 text-lg font-bold text-slate-950 rounded-2xl border p-2">{step.description}</h3>

        { !last && (
          <div className="mt-3 text-center">
            <Badge tone="blue" className="cursor-pointer" onClick={() => setStep(activity.steps[step.order])}>
              Avançar
            </Badge>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
