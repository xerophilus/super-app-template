export interface MicroAppMetadata {
  id: string;
  name: string;
  description: string;
  icon: {
    type: 'emoji' | 'url' | 'component';
    value: string;
  };
  bundleUrl: string;
  defaultProps?: Record<string, any>;
  requiresAuth?: boolean;
}

export interface LoadedMicroApp {
  Component: React.ComponentType<any>;
  metadata: MicroAppMetadata;
} 