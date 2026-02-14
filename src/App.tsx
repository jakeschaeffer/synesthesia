import { SplitScreen } from './components/layout/SplitScreen';
import { GradientCanvas } from './components/visualization/GradientCanvas';
import { BottomPanel } from './components/controls/BottomPanel';
import { ColorVariantModal } from './components/color-picker/ColorVariantModal';

export default function App() {
  return (
    <>
      <SplitScreen
        top={<GradientCanvas />}
        bottom={<BottomPanel />}
      />
      <ColorVariantModal />
    </>
  );
}
