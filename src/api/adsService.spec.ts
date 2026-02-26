import { vi, describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from './apiClient';
import { updateAd, UpdateAdPayload } from './adsService';

vi.mock('./apiClient', () => ({
  apiClient: {
    put: vi.fn()
  }
}));

describe('adsService.updateAd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always sends FormData (even without files)', async () => {
    const payload: UpdateAdPayload = {
      title: 'foo',
      price: 123,
      deleteImageIds: [7],
      mainImageId: 7,
      imageOrder: [7, 8]
    };
    await updateAd(5, payload);
    expect(apiClient.put).toHaveBeenCalledTimes(1);
    const [url, data] = (apiClient.put as any).mock.calls[0];
    expect(url).toContain('/api/ads/5');
    expect(data).toBeInstanceOf(FormData);
    const form = data as FormData;
    expect(form.get('title')).toBe('foo');
    expect(form.get('price')).toBe('123');
    expect(form.getAll('DeleteImageIds')).toEqual(['7']);
    expect(form.get('MainImageId')).toBe('7');
    expect(form.getAll('ImageOrder')).toEqual(['7', '8']);
  });

  it('appends numeric type values correctly, including zero', async () => {
    const payload: UpdateAdPayload = { type: 0, title: 'zero' };
    await updateAd(1, payload);
    const data = (apiClient.put as any).mock.calls[0][1] as FormData;
    expect(data.get('type')).toBe('0');
    expect(data.get('title')).toBe('zero');
  });

  it('respects newFirst flag by ordering new images ahead of order fields', async () => {
    const f1 = new File(['a'], 'a.png', { type: 'image/png' });
    const f2 = new File(['b'], 'b.png', { type: 'image/png' });
    const payload: UpdateAdPayload = {
      title: 'foo',
      newImages: [f1, f2],
      imageOrder: [10, 11],
      newFirst: true
    };
    await updateAd(2, payload);
    const form = (apiClient.put as any).mock.calls[0][1] as FormData;
    // new images should come before imageOrder entries in form
    const entries: string[] = [];
    form.forEach((_, k) => entries.push(k));
    const firstNewIndex = entries.indexOf('NewImages');
    const orderIndex = entries.indexOf('ImageOrder');
    expect(firstNewIndex).toBeLessThan(orderIndex);
  });

  it('sends FormData when files present, with flat fields', async () => {
    const fakeFile = new File(['abc'], 'a.png', { type: 'image/png' });
    const payload: UpdateAdPayload = { newImages: [fakeFile], title: 'bar' };
    await updateAd('10', payload);

    expect(apiClient.put).toHaveBeenCalledTimes(1);
    const [url, data] = (apiClient.put as any).mock.calls[0];
    expect(url).toContain('/api/ads/10');
    expect(data).toBeInstanceOf(FormData);
    const form = data as FormData;
    expect(form.get('title')).toBe('bar');
    expect(form.getAll('NewImages')[0]).toBe(fakeFile);
  });

  it('adds DeleteImageIds, MainImageId and ImageOrder when provided', async () => {
    const payload: UpdateAdPayload = {
      deleteImageIds: [1, 2],
      mainImageId: 2,
      imageOrder: [2, 1]
    };
    await updateAd('7', payload);
    expect(apiClient.put).toHaveBeenCalledTimes(1);
    const data = (apiClient.put as any).mock.calls[0][1] as FormData;
    const form = data as FormData;
    expect(form.getAll('DeleteImageIds')).toEqual(['1', '2']);
    expect(form.get('MainImageId')).toBe('2');
    expect(form.getAll('ImageOrder')).toEqual(['2', '1']);
  });

  it('flattens nested arrays for ids and order', async () => {
    const payload: UpdateAdPayload = {
      deleteImageIds: [[3, 4], 5],
      imageOrder: [ [7,8], 9 ]
    };
    await updateAd('8', payload);
    const form = (apiClient.put as any).mock.calls[0][1] as FormData;
    expect(form.getAll('DeleteImageIds')).toEqual(['3','4','5']);
    expect(form.getAll('ImageOrder')).toEqual(['7','8','9']);
  });

  it('passes through caller-supplied FormData unchanged', async () => {
    const form = new FormData();
    form.append('title', 'direct');
    await updateAd(99, form);
    expect(apiClient.put).toHaveBeenCalledTimes(1);
    const [url, data] = (apiClient.put as any).mock.calls[0];
    expect(url).toContain('/api/ads/99');
    expect(data).toBe(form);
    expect(data.get('title')).toBe('direct');
  });
});
