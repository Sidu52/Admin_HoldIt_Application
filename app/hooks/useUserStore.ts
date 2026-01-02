// app/hooks/useUserStore.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// User-specific selectors
export const useUserState = () => useAppSelector((state) => state.users);
export const useUsers = () => useAppSelector((state) => state.users.users);
export const useSelectedUsers = () => useAppSelector((state) => state.users.selectedUsers);
export const useCurrentUser = () => useAppSelector((state) => state.users.currentUser);
export const useUserPagination = () => useAppSelector((state) => state.users.pagination);
export const useUserFilters = () => useAppSelector((state) => state.users.filters);
export const useUserLoading = () => useAppSelector((state) => state.users.loading);
export const useUserError = () => useAppSelector((state) => state.users.error);