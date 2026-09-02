import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { getGameDefinition } from "../../games/registry";
import { GAME_COMPONENTS } from "../../games/gameComponents";
import type { GameId, GameResult } from "../../types";
import { getPet, randomMessage } from "../../data/pets";
import { CameraStage } from "../../components/CameraStage/CameraStage";
import { ErrorState } from "../../components/ErrorState/ErrorState";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { Pet } from "../../components/Pet/Pet";
import { useCameraGame } from "../../hooks/useCameraGame";
import { useDemoPointer } from "../../hooks/useDemoPointer";
import { makeGameResult } from "../../utils/scoring";
import { track } from "../../utils/analytics";
import "./GamePlay.css";

type Stage = "permission" | "playing" | "complete";

/**
 * Hosts a single break: camera permission -> live game (or demo mode)
 * -> completion + pet celebration -> back to dashboard.
 * (PRD sections 12-15 gameplay, 17-18 privacy/fallback, 42 demo mode.)
 */
export function GamePlay() {
  const { gameId } = useParams<{ gameId: GameId }>();
  const { settings, recordGameResult } = useAppContext();
  const navigate = useNavigate();
  const stageRef = useRef<HTMLDivElement>(null);

  const definition = gameId ? getGameDefinition(gameId) : undefined;
  const GameComponent = definition ? GAME_COMPONENTS[definition.id] : undefined;

  const [stage, setStage] = useState<Stage>("permission");
  const [result, setResult] = useState<GameResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const camera = useCameraGame(definition?.trackingType ?? "none");
  const demoFrame = useDemoPointer(
    stageRef,
    definition?.trackingType === "pose" ? "pose" : definition?.trackingType === "face" ? "face" : "hand",
  );

  const pet = getPet(settings.pet);

  const activeFrame = demoMode ? demoFrame : camera.frame;

  const handleStartCamera = async () => {
    await camera.start();
    setStage("playing");
  };

  const handleStartDemo = () => {
    camera.enterDemoMode();
    setDemoMode(true);
    setStage("playing");
  };

  const handleComplete = (partial: Omit<GameResult, "gameId" | "completedAt" | "demoMode" | "accuracy">) => {
    if (!definition) return;
    const finalResult = makeGameResult({ ...partial, gameId: definition.id, demoMode });
    track("game_completed", { gameId: definition.id, score: finalResult.score });
    track("game_score", { gameId: definition.id, score: finalResult.score });
    recordGameResult(finalResult);
    setResult(finalResult);
    setStage("complete");
  };

  const handleDone = () => {
    navigate("/dashboard");
  };

  const completionMessage = useMemo(() => randomMessage(pet.messages.completion), [pet]);

  if (!definition || !GameComponent) {
    return (
      <div className="page">
        <ErrorState title="Game not found" message="Please pick a game again." onRetry={() => navigate("/break")} />
      </div>
    );
  }

  return (
    <div className="page bb-gameplay">
      {stage === "permission" && (
        <PermissionGate
          onEnable={handleStartCamera}
          onSkip={() => navigate("/break")}
          status={camera.status}
          errorMessage={camera.errorMessage}
          onDemoMode={handleStartDemo}
        />
      )}

      {stage === "playing" && (
        <>
          <header className="bb-gameplay-header">
            <span>
              {definition.emoji} {definition.name}
            </span>
          </header>
          <div ref={stageRef}>
            <CameraStage videoRef={camera.videoRef} active={demoMode || camera.status === "ready"} demoMode={demoMode}>
              <GameComponent
                frame={activeFrame}
                demoMode={demoMode}
                durationSeconds={definition.duration}
                reducedMotion={settings.reducedMotion}
                onComplete={handleComplete}
              />
            </CameraStage>
          </div>
          {!demoMode && camera.status === "loading-model" && (
            <p className="bb-gameplay-loading">Loading movement detection…</p>
          )}
        </>
      )}

      {stage === "complete" && result && (
        <div className="bb-gameplay-complete card">
          <h2>Break complete! 🎉</h2>
          <Pet petId={settings.pet} mood="celebrate" message={completionMessage} size="lg" />
          <p className="bb-gameplay-score">Score: {result.score}</p>
          <p className="bb-gameplay-accuracy">
            {result.hits}/{result.attempts} · {result.accuracy}% accuracy
          </p>
          <Button size="lg" onClick={handleDone}>
            Back to Work
          </Button>
        </div>
      )}
    </div>
  );
}

function PermissionGate({
  onEnable,
  onSkip,
  onDemoMode,
  status,
  errorMessage,
}: {
  onEnable: () => void;
  onSkip: () => void;
  onDemoMode: () => void;
  status: string;
  errorMessage: string;
}) {
  if (status === "error") {
    return (
      <ErrorState
        title="Camera access is unavailable."
        message={errorMessage || "We couldn't access your camera."}
        onRetry={onEnable}
        onDemoMode={onDemoMode}
      />
    );
  }

  return (
    <Modal
      open
      title="Camera required"
      onClose={onSkip}
      actions={
        <>
          <Button onClick={onEnable} disabled={status === "requesting-permission"}>
            {status === "requesting-permission" ? "Requesting…" : "Enable Camera"}
          </Button>
          <Button variant="secondary" onClick={onDemoMode}>
            Play Demo
          </Button>
        </>
      }
    >
      <p>
        BreakBuddy uses your camera to detect your movement during the game. Your camera feed is
        processed locally in your browser for gameplay and is never stored or uploaded.
      </p>
    </Modal>
  );
}
