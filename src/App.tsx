import { SplitScreen } from './components/layout/SplitScreen';
import { GradientCanvas } from './components/visualization/GradientCanvas';
import { TextInputArea } from './components/input/TextInputArea';
import { GradientControls } from './components/controls/GradientControls';
import { ProfileManager } from './components/profile/ProfileManager';
import { ColorVariantModal } from './components/color-picker/ColorVariantModal';

export default function App() {
  return (
    <>
      <SplitScreen
        top={<GradientCanvas />}
        bottom={
          <>
            <TextInputArea />
            <GradientControls />
            <ProfileManager />
          </>
        }
      />
      <ColorVariantModal />
    </>
  );
}
