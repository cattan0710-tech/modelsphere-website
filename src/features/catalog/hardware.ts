import type { Variant } from './data';

const vendorNames: Record<string, string> = {
  nvidia: '英伟达 NVIDIA',
  ascend: '华为昇腾',
  iluvatar: '天数智芯',
  hygon: '海光',
  mthreads: '摩尔线程',
  amd: 'AMD',
};
const aliases: Record<string, string> = {
  huawei: 'ascend',
  iluvatarcorex: 'iluvatar',
  'iluvatar-corex': 'iluvatar',
  'moore-threads': 'mthreads',
  moorethreads: 'mthreads',
};

export function hardwareVendor(product: string, declaredVendor = ''): string {
  const prefix = product.split('-')[0].trim().toLowerCase();
  const known = aliases[prefix] ?? prefix;
  if (vendorNames[known]) return known;
  const declared = declaredVendor.trim().toLowerCase();
  return aliases[declared] ?? (declared || 'other');
}

export function variantVendors(variant: Variant): string[] {
  return Array.from(
    new Set(
      variant.requires.gpuProduct.length
        ? variant.requires.gpuProduct.map((product) =>
            hardwareVendor(product, variant.requires.vendor),
          )
        : variant.requires.vendor
          ? [hardwareVendor('', variant.requires.vendor)]
          : [],
    ),
  );
}

export function vendorLabel(vendor: string): string {
  return vendorNames[vendor] ?? (vendor === 'other' ? '其他厂商' : vendor);
}
