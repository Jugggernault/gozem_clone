import type { Address, Contact, PaymentMethod, Profile } from "@/lib/types";
import { SEED_ADDRESSES, SEED_PAYMENT_METHOD, SEED_PROFILE, TRUSTED_CONTACTS } from "@/lib/mock/user";
import { type Slice, uid } from "../types";

export type ProfileState = { user: Profile; addresses: Address[]; paymentMethod: PaymentMethod; trustedContacts: Contact[] };
export type ProfileSlice = {
  profile: ProfileState;
  updateProfile: (patch: Partial<Profile>) => void;
  addAddress: (a: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void; // default method, preselected in ride confirm / checkout
  addTrustedContact: (c: Omit<Contact, "id">) => void;
  removeTrustedContact: (id: string) => void;
};

export const initialProfile = (): ProfileState => ({
  user: { ...SEED_PROFILE },
  addresses: SEED_ADDRESSES.map((a) => ({ ...a })),
  paymentMethod: SEED_PAYMENT_METHOD,
  trustedContacts: TRUSTED_CONTACTS.map((c) => ({ ...c })),
});

export const createProfileSlice: Slice<ProfileSlice> = (set) => ({
  profile: initialProfile(),
  updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, user: { ...s.profile.user, ...patch } } })),
  addAddress: (a) => {
    const address = { ...a, id: uid("addr") };
    set((s) => ({ profile: { ...s.profile, addresses: [...s.profile.addresses, address] } }));
    return address;
  },
  removeAddress: (id) => set((s) => ({ profile: { ...s.profile, addresses: s.profile.addresses.filter((a) => a.id !== id) } })),
  setPaymentMethod: (paymentMethod) => set((s) => ({ profile: { ...s.profile, paymentMethod } })),
  addTrustedContact: (c) => set((s) => ({ profile: { ...s.profile, trustedContacts: [...s.profile.trustedContacts, { ...c, id: uid("contact") }] } })),
  removeTrustedContact: (id) => set((s) => ({ profile: { ...s.profile, trustedContacts: s.profile.trustedContacts.filter((c) => c.id !== id) } })),
});
