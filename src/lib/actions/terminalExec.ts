"use server";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function executeTerminalCommand(command = "npm run build") {
  const startTime = Date.now();
  try {
    const cwd = process.cwd();
    const { stdout, stderr } = await execAsync(command, { cwd, timeout: 30000 });
    const durationMs = Date.now() - startTime;

    return {
      success: true,
      command,
      exitCode: 0,
      output: stdout || stderr || "Command completed with zero output.",
      durationMs,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      command,
      exitCode: error.code || 1,
      output: error.stdout || error.stderr || error.message || "Command execution failed.",
      durationMs,
      timestamp: new Date().toISOString(),
    };
  }
}
