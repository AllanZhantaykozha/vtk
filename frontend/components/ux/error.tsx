import React from "react";

interface ErrorProps {
  error: unknown;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function Error({ error }: ErrorProps) {
  if (isError(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">ERROR</p>
    </div>
  );
}
