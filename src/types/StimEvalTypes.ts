// screen props
export interface MainScreenProps {
  onNewConfig: () => void;
  onLoadConfig: () => void;
}

export interface ConfigScreenProps {
  onMainScreen: () => void;
  onPresentationScreen: () => void;
  setSavePath: (path: string) => void;
}

export interface ShowPreviewProps {
  onAccept: () => void;
  onCancel: () => void;
  data: ConfigData | null;
}

export interface PresentationScreenProps {
  onMainScreen: () => void;
  setSavePath: (path: string) => void;
  savePath: string;
}

// other
export interface ConfigData {
  bgcolor: string;
  imgw: number;
  imgh: number;
  nres: number;
  responses: {
    name: string;
    n: number;
    res: string[];
  }[];
  mediapaths: string[];
  mediatypes: string[];
  rand: boolean;
}

export interface UserResponses {
  image: string;
  res: { name: string; val: string }[];
}

export interface ResponseTypes {
  name: string;
  n: number;
  res: string[];
}
