import Router from "next/router";
import { Button } from "./Button";
// Styles
import { useMemo, useState } from "react";
import { Background } from "src/components/Layout/Background";
import { GameCompleteScreen } from "src/components/Screens/GameCompleteScreen";
import { t } from "src/lib/translations";
import { resetResults } from "src/stores/useResultStore";
import { resetTaskProgress, useTaskProgress } from "src/stores/useTaskProgress";
import { setAssessmentMode, setDemographics } from "src/utils/assessment";
import { getTaskStatus } from "src/utils/task-verif";
import styles from "../pages/signin/signin.module.css";

export function LandingPage() {
  const { taskProgress } = useTaskProgress();
  const { activeTask } = useMemo(() => getTaskStatus(taskProgress), [taskProgress]);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [error, setError] = useState("");

  if (!activeTask) {
    return <GameCompleteScreen result="success" color={""} task={"task1"} skip />;
  }

  const handleProceed = () => {
    if (!gender || !ageRange) {
      setError("Please select your gender and age range to continue.");
      return;
    }
    setError("");
    setDemographics({ gender, ageRange });
    setAssessmentMode("short");
    resetTaskProgress();
    resetResults();
    Router.push("/about");
  };

  return (
    <Background className="justify-center gap-6 section-padding-large">
      <div className="space-y-5 sm:space-y-7">
        <div className={`${styles.container} max-w-screen-md`}>
          <img src="/logo.png" alt="Gray Matter Logo" className={styles.logo} />
          <div className={styles.textGroup}>
            <div className={styles.nameLine}>Gray Matter</div>
            <div className={styles.nameLine}>Solutions</div>
            <div className={styles.subtitle}>{t.DISCLAIMER["A spin-off from NTU, Singapore"]}</div>
          </div>
        </div>
      </div>

      <div className="w-full mt-6 space-y-4 text-center">
        <div className={styles.title}>
          Re<span className={styles.blue}>COG</span>n<span className={styles.blue}>AI</span>ze
        </div>
        <p className={styles.description}>
          {
            t.DISCLAIMER[
              "This is a quick digital assessment that helps test your brain performance.\n\nBefore you begin, please let your doctor know if you have any vision or hearing difficulties, as this may affect how you complete the test."
            ]
          }
        </p>
        <p className="text-sm sm:text-base" style={{ fontWeight: 800, color: " #002D7C" }}>
          {t.DISCLAIMER["As seen on"]}
        </p>
        <div className="!mt-2 gap-4 c">
          <img src="/images/landing/img (1).png" className="size-14" />
          <img src="/images/landing/img (2).png" className="size-14" />
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto mt-6 space-y-4">
        <div className="space-y-3 text-left">
          <div>
            <label className="block text-sm font-semibold text-[#002D7C]">Gender</label>
            <select
              className="w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#002D7C]">Age range</label>
            <select
              className="w-full px-3 py-2 mt-1 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={ageRange}
              onChange={(event) => setAgeRange(event.target.value)}
            >
              <option value="">Select age range</option>
              <option value="18-29">18-29</option>
              <option value="30-39">30-39</option>
              <option value="40-49">40-49</option>
              <option value="50-59">50-59</option>
              <option value="60+">60+</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <Button onClick={handleProceed}>{t.GENERAL.Proceed}</Button>
      </div>
    </Background>
  );
}
