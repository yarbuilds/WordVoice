import {Composition} from 'remotion';
import {WordVoiceLaunch} from './WordVoiceLaunch';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="WordVoiceLaunch"
        component={WordVoiceLaunch}
        durationInFrames={560}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
