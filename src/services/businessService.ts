
import { api } from "@/lib/api";
import { Business, CreateBusinessDto, UpdateBusinessDto } from "@/types/business";

const orgPath = (orgId: string) => `/private/organizations/${orgId}`;

export const getBusinesses = (orgId: string) =>
  api.get<Business[]>(`${orgPath(orgId)}/businesses`).then((r) => r.data);

export const getBusinessById = (orgId: string, id: string) =>
  api.get<Business>(`${orgPath(orgId)}/business/${id}`).then((r) => r.data);

export const createBusiness = (orgId: string, dto: CreateBusinessDto) =>
  api
    .post<Business>(`${orgPath(orgId)}/businesses`, { ...dto, uiConfig: dto.uiConfig ?? {} })
    .then((r) => r.data);

export const updateBusiness = (orgId: string, id: string, dto: UpdateBusinessDto) =>
  api.patch<Business>(`${orgPath(orgId)}/business/${id}`, dto).then((r) => r.data);

export const deleteBusiness = (orgId: string, id: string) =>
  api.delete(`${orgPath(orgId)}/business/${id}`).then(() => undefined);