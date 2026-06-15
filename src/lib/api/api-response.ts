import { NextResponse } from 'next/server';

export function success<T>(data: T, message = 'ok', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

export function fail(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
    },
    { status },
  );
}
