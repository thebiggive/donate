import { TestBed, waitForAsync } from '@angular/core/testing';
import { ImageService } from './image.service';

import { OptimisedImagePipe } from './optimised-image.pipe';

describe('OptimisedImagePipe', () => {
  let pipe: OptimisedImagePipe;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        ImageService,
      ],
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    pipe = new OptimisedImagePipe(TestBed.inject(ImageService));
  });

  it('is instantiated', () => {
    expect(pipe).toBeTruthy();
  });

  it('processes a null URI', async () => {
    expect(await pipe.transform(null, 777)).toEqual(null);
  });

  it('processes a non-null URI', async () => {
    expect(await pipe.transform('https://example.com/image.png', 777))
      .toEqual('https://example.com/image.png?width=777&format=webp'); // Modern test browsers support webp.
  });
});
