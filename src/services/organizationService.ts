
import { api } from "@/lib/api";
import {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "../types/organizations";

export const getOrganizations = () =>
  api.get<Organization[]>("/private/organizations").then((r) => r.data);

export const getOrganizationById = (id: string) =>
  api.get<Organization>(`/private/organization/${id}`).then((r) => r.data);

export const createOrganization = (dto: CreateOrganizationDto) =>
  api
    .post<Organization>("/private/organizations", {
      ...dto,
      billingMeta: dto.billingMeta ?? {},
    })
    .then((r) => r.data);

export const updateOrganization = (id: string, dto: UpdateOrganizationDto) =>
  api.patch<Organization>(`/private/organization/${id}`, dto).then((r) => r.data);

export const deleteOrganization = (id: string) =>
  api.delete(`/private/organization/${id}`).then(() => undefined);