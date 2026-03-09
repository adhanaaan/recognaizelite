import Router from "next/router";
import { Background } from "src/components/Layout/Background";
import { task2, task3, task4, task5 } from "src/constants/tasks";
import { Button } from "./Button";

const games = [
  { task: task2, route: "/symbol-matching/demo" },
  { task: task3, route: "/trail-making/demo" },
  { task: task4, route: "/airplane-game/demo" },
  { task: task5, route: "/grocery-shopping/demo" },
];

export function DemoGameSelector() {
  return (
    <Background className="justify-start section-padding">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: "#002D7C" }}>
            Game Selector
          </h1>
          <p className="text-sm text-gray-600">Select a game to start</p>
        </div>

        <div className="space-y-4">
          {games.map(({ task, route }, index) => (
            <button
              key={index}
              onClick={() => Router.push(route)}
              className="w-full p-4 bg-white rounded-2xl shadow-md border border-gray-200 text-left transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ borderLeft: `6px solid ${task.color}` }}
            >
              <h3 className="text-lg font-semibold" style={{ color: task.color }}>
                {task.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{task.info}</p>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={() => Router.push("/landing")}
            className="w-full bg-gradient-to-b from-blue-500 to-blue-600"
          >
            Go to Landing Page
          </Button>
        </div>
      </div>
    </Background>
  );
}
