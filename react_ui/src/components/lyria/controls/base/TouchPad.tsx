/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {useCallback} from 'react';
import {useLyriaStore, LyriaState} from '@/data';
import {lyria} from '@/data/params';
import {TouchXYPad} from '@/components/ui';
import {Flex} from '@/layout/geometry';

const LyriaTouchPad: React.FC = () => {
  const temperature = useLyriaStore((state: LyriaState) => state.temperature);
  const guidance = useLyriaStore((state: LyriaState) => state.guidance);
  const updateParam = useLyriaStore((state: LyriaState) => state.updateParam);

  const handleTempChange = useCallback(
    (newValue: number) => {
      updateParam({temperature: newValue});
    },
    [updateParam],
  );

  const handleGuidanceChange = useCallback(
    (newValue: number) => {
      updateParam({guidance: newValue});
    },
    [updateParam],
  );

  return (
    <Flex direction="col" justify="center" className="items-center">
      <TouchXYPad
        xLabel={lyria.temperature.name}
        yLabel={lyria.guidance.name}
        xMin={lyria.temperature.range[0]}
        xMax={lyria.temperature.range[1]}
        yMin={lyria.guidance.range[0]}
        yMax={lyria.guidance.range[1]}
        xStep={lyria.temperature.step}
        yStep={lyria.guidance.step}
        xValue={temperature}
        yValue={guidance}
        onXChange={handleTempChange}
        onYChange={handleGuidanceChange}
      />
    </Flex>
  );
};

export {LyriaTouchPad};
