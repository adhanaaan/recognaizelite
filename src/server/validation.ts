import type { ResultDataType } from "src/stores/useResultStore";

/**
 * Server-side validation for result data to prevent tampering.
 * This file is ONLY imported in API routes (pages/api/*) which are
 * server-side only by default in Next.js Pages Router.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates the structure and content of result data
 * Prevents malicious or tampered data from being processed
 */
export function validateResultData(result: any): result is ResultDataType {
  if (!result || typeof result !== "object") {
    throw new ValidationError("Invalid result data: must be an object");
  }

  // Validate task2 (Processing Speed - Symbol Matching)
  if (result.task2) {
    if (Array.isArray(result.task2)) {
      if (result.task2.length > 0) {
        const task2Data = result.task2[0];
        if (typeof task2Data?.score !== "number" || task2Data.score < 0 || task2Data.score > 1000) {
          throw new ValidationError("Invalid task2 score: must be between 0 and 1000");
        }
      }
    } else if (typeof result.task2 === "object") {
      const score = (result.task2 as any).score;
      if (typeof score !== "undefined" && (typeof score !== "number" || score < 0 || score > 1000)) {
        throw new ValidationError("Invalid task2 score: must be between 0 and 1000");
      }
    }
  }

  // Validate task3 (Executive Function - Trail Making)
  if (result.task3 && typeof result.task3 === "object") {
    const { correct, errors, time } = result.task3 as any;
    if (typeof correct !== "undefined") {
      if (typeof correct !== "number" || correct < 0 || correct > 1000) {
        throw new ValidationError("Invalid task3 correct: must be between 0 and 1000");
      }
    }
    if (typeof errors !== "undefined") {
      if (typeof errors !== "number" || errors < 0 || errors > 1000) {
        throw new ValidationError("Invalid task3 errors: must be between 0 and 1000");
      }
    }
    if (typeof time !== "undefined") {
      if (typeof time !== "string" || !time.match(/^\d+(\.\d+)?s$/)) {
        throw new ValidationError("Invalid task3 time: must be in format 'XXs'");
      }
      const timeValue = parseFloat(time);
      if (timeValue < 0 || timeValue > 3600) {
        throw new ValidationError("Invalid task3 time: must be between 0 and 3600 seconds");
      }
    }
  }

  // Validate task4 (Attention - Airplane Game)
  if (result.task4 && typeof result.task4 === "object") {
    const { correct, errors } = result.task4 as any;
    if (typeof correct !== "undefined") {
      if (typeof correct !== "number" || correct < 0 || correct > 1000) {
        throw new ValidationError("Invalid task4 correct: must be between 0 and 1000");
      }
    }
    if (typeof errors !== "undefined") {
      if (typeof errors !== "number" || errors < 0 || errors > 1000) {
        throw new ValidationError("Invalid task4 errors: must be between 0 and 1000");
      }
    }
  }

  // Validate task5 (Working Memory - Grocery Shopping)
  if (result.task5 && typeof result.task5 === "object") {
    const { rounds } = result.task5 as any;
    if (typeof rounds !== "undefined") {
      if (!Array.isArray(rounds) || rounds.length > 100) {
        throw new ValidationError("Invalid task5 rounds: must be an array with max 100 items");
      }
      rounds.forEach((round: any, index: number) => {
        if (!round || typeof round !== "object") {
          throw new ValidationError(`Invalid task5 round ${index}: must be an object`);
        }
        if (typeof round.correct !== "undefined") {
          if (typeof round.correct !== "number" || round.correct < 0 || round.correct > 1000) {
            throw new ValidationError(`Invalid task5 round ${index} correct: must be between 0 and 1000`);
          }
        }
        if (typeof round.errors !== "undefined") {
          if (typeof round.errors !== "number" || round.errors < 0 || round.errors > 1000) {
            throw new ValidationError(`Invalid task5 round ${index} errors: must be between 0 and 1000`);
          }
        }
        if (typeof round.steps !== "undefined") {
          if (Array.isArray(round.steps)) {
            if (round.steps.length > 1000) {
              throw new ValidationError(`Invalid task5 round ${index} steps: max 1000 entries`);
            }
          } else if (typeof round.steps === "number") {
            if (round.steps < 0 || round.steps > 1000) {
              throw new ValidationError(`Invalid task5 round ${index} steps: must be between 0 and 1000`);
            }
          } else {
            throw new ValidationError(`Invalid task5 round ${index} steps: must be a number or array`);
          }
        }
        if (typeof round.time !== "undefined") {
          if (typeof round.time !== "string" || !round.time.match(/^\d+(\.\d+)?s$/)) {
            throw new ValidationError(`Invalid task5 round ${index} time: must be in format 'XXs'`);
          }
        }
        if (typeof round.success !== "undefined") {
          if (round.success !== "Yes" && round.success !== "No") {
            throw new ValidationError(`Invalid task5 round ${index} success: must be 'Yes' or 'No'`);
          }
        }
      });
    }
  }

  return true;
}

/**
 * Sanitizes result data by removing any extra fields that shouldn't be present
 * Prevents injection of malicious data
 */
export function sanitizeResultData(result: any): ResultDataType {
  const sanitized: Partial<ResultDataType> = {};

  // Sanitize task2
  if (result.task2) {
    if (Array.isArray(result.task2) && result.task2.length > 0) {
      sanitized.task2 = [{ score: Number(result.task2[0]?.score) }];
    } else if (typeof result.task2 === "object" && "score" in result.task2) {
      sanitized.task2 = { score: Number(result.task2.score) };
    }
  }

  // Sanitize task3
  if (result.task3 && typeof result.task3 === "object") {
    sanitized.task3 = {
      correct: Number(result.task3.correct),
      errors: Number(result.task3.errors),
      time: String(result.task3.time),
    };
  }

  // Sanitize task4
  if (result.task4 && typeof result.task4 === "object") {
    sanitized.task4 = {
      correct: Number(result.task4.correct),
      errors: Number(result.task4.errors),
    };
  }

  // Sanitize task5
  if (result.task5 && typeof result.task5 === "object" && Array.isArray(result.task5.rounds)) {
    sanitized.task5 = {
      rounds: result.task5.rounds.map((round: any) => {
        const sanitizedRound: any = {};

        if (typeof round.correct === "number") {
          sanitizedRound.correct = Number(round.correct);
        }
        if (typeof round.errors === "number") {
          sanitizedRound.errors = Number(round.errors);
        }
        if (Array.isArray(round.steps)) {
          sanitizedRound.steps = round.steps.map((step: any) => ({
            success: typeof step?.success === "string" ? step.success : undefined,
            time: typeof step?.time === "string" ? step.time : undefined,
          }));
        } else if (typeof round.steps === "number") {
          sanitizedRound.steps = Number(round.steps);
        }
        if (typeof round.time === "string") {
          sanitizedRound.time = String(round.time);
        }
        if (typeof round.success === "string") {
          sanitizedRound.success = round.success;
        }

        return sanitizedRound;
      }),
    };
  }

  return sanitized as ResultDataType;
}
