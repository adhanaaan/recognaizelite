import { Component, ErrorInfo, ReactNode } from "react";
import { __prod__ } from "src/constants";
import { Button } from "src/ui/Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Error Boundary] Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-blue-100 cc">
          <h4>Oops, there is an error!</h4>
          <Button className="mt-6 w-80" onClick={window.location.reload}>
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
