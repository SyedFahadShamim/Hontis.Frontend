export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UserInfo {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginOn: string | null;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: UserInfo;
  roles: string[];
  permissions: string[];
}

export interface UserProfileResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginOn: string | null;
  roles: RoleDto[];
  permissions: string[];
}

export interface RoleDto {
  roleId: number;
  roleCode: string;
  roleName: string;
}

export interface UserListResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginOn: string | null;
  roles: string[];
}

export interface UserDetailResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginOn: string | null;
  createdOn: string;
  roles: RoleDto[];
  permissions: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
}

export interface AssignRolesRequest {
  roleIds: number[];
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
}

export interface RoleResponse {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  userCount: number;
}

export interface RoleDetailResponse {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  isActive: boolean;
  permissions: PermissionDto[];
}

export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
}

export interface UpdateRoleRequest {
  roleName: string;
  description?: string;
}

export interface PermissionDto {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  moduleName: string;
  description: string | null;
}

export interface AssignPermissionsRequest {
  permissionIds: number[];
}

export interface ProductCategoryListResponse {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  status: string;
  updatedOn: string | null;
}

export interface ProductCategoryDetailResponse {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  description: string | null;
  status: string;
  sortOrder: number;
  createdOn: string;
  createdBy: string;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateProductCategoryRequest {
  categoryCode: string;
  categoryName: string;
  description?: string;
  status: string;
  sortOrder: number;
}

export interface UpdateProductCategoryRequest {
  categoryCode: string;
  categoryName: string;
  description?: string;
  status: string;
  sortOrder: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ManufacturerListResponse {
  manufacturerId: number;
  manufacturerCode: string;
  manufacturerName: string;
  country: string | null;
  status: string;
  updatedOn: string | null;
}

export interface ManufacturerDetailResponse {
  manufacturerId: number;
  manufacturerCode: string;
  manufacturerName: string;
  country: string | null;
  status: string;
  createdOn: string;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateManufacturerRequest {
  manufacturerCode: string;
  manufacturerName: string;
  country?: string;
  status: string;
}

export interface UpdateManufacturerRequest {
  manufacturerCode: string;
  manufacturerName: string;
  country?: string;
  status: string;
}

export interface SupplierListResponse {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  city: string | null;
  country: string | null;
  status: string;
  updatedOn: string | null;
}

export interface SupplierDetailResponse {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  city: string | null;
  country: string | null;
  status: string;
  createdOn: string;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateSupplierRequest {
  supplierCode: string;
  supplierName: string;
  city?: string;
  country?: string;
  status: string;
}

export interface UpdateSupplierRequest {
  supplierCode: string;
  supplierName: string;
  city?: string;
  country?: string;
  status: string;
}

export interface DosageFormListResponse {
  dosageFormId: number;
  dosageFormCode: string;
  dosageFormName: string;
  status: string;
  updatedOn: string | null;
}

export interface DosageFormDetailResponse {
  dosageFormId: number;
  dosageFormCode: string;
  dosageFormName: string;
  status: string;
  createdOn: string;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateDosageFormRequest {
  dosageFormCode: string;
  dosageFormName: string;
  status: string;
}

export interface UpdateDosageFormRequest {
  dosageFormCode: string;
  dosageFormName: string;
  status: string;
}

export interface ProductListResponse {
  productId: number;
  hontisProductCode: string;
  productName: string;
  brandName: string | null;
  categoryCode: string | null;
  categoryName: string | null;
  manufacturerCode: string | null;
  manufacturerName: string | null;
  dosageFormName: string | null;
  mrpCurrent: number;
  lifecycleStatus: string;
  currentSkuPriceCode: string | null;
  updatedOn: string | null;
}

export interface ProductDetailResponse {
  productId: number;
  hontisProductCode: string;
  productName: string;
  brandName: string | null;
  dosageFormCode: string | null;
  dosageFormName: string | null;
  categoryCode: string | null;
  categoryName: string | null;
  manufacturerCode: string | null;
  manufacturerName: string | null;
  supplierCode: string | null;
  supplierName: string | null;
  primaryMoleculeCode: string | null;
  primaryMoleculeName: string | null;
  salesTaxTypeCode: string | null;
  salesTaxValue: number;
  advIncomeTaxTypeCode: string | null;
  advIncomeTaxValue: number;
  mrpCurrent: number;
  tradePriceCurrent: number;
  distributionPriceCurrent: number;
  productPriceCurrent: number;
  priceEffectiveFrom: string | null;
  lifecycleStatus: string;
  currentSkuPriceCode: string | null;
  createdOn: string;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateProductRequest {
  hontisProductCode: string;
  productName: string;
  brandName?: string;
  dosageFormCode?: string;
  categoryCode?: string;
  manufacturerCode?: string;
  supplierCode?: string;
  primaryMoleculeCode?: string;
  salesTaxTypeCode?: string;
  salesTaxValue: number;
  advIncomeTaxTypeCode?: string;
  advIncomeTaxValue: number;
  mrpCurrent: number;
  tradePriceCurrent: number;
  distributionPriceCurrent: number;
  productPriceCurrent: number;
  priceEffectiveFrom?: string;
  lifecycleStatus: string;
  skuPriceCode: string;
}

export interface UpdateProductRequest {
  hontisProductCode: string;
  productName: string;
  brandName?: string;
  dosageFormCode?: string;
  categoryCode?: string;
  manufacturerCode?: string;
  supplierCode?: string;
  primaryMoleculeCode?: string;
  salesTaxTypeCode?: string;
  salesTaxValue: number;
  advIncomeTaxTypeCode?: string;
  advIncomeTaxValue: number;
  mrpCurrent: number;
  tradePriceCurrent: number;
  distributionPriceCurrent: number;
  productPriceCurrent: number;
  priceEffectiveFrom?: string;
  lifecycleStatus: string;
}

export interface UpdateProductLifecycleRequest {
  lifecycleStatus: string;
}

export interface MoleculeListResponse {
  moleculeId: number;
  moleculeCode: string;
  moleculeName: string;
  status: string;
}

export interface TaxTypeListResponse {
  taxTypeId: number;
  taxTypeCode: string;
  taxTypeName: string;
  status: string;
}

export interface ChangePricesRequest {
  effectiveFrom: string;
  skuPriceCode: string;
  mrp: number;
  tradePrice: number;
  distributionPrice: number;
  productPrice: number;
  currency: string;
  source?: string;
  notes?: string;
}

export interface ChangePricesResponse {
  hontisProductCode: string;
  skuPriceCode: string;
  mrpCurrent: number;
  tradePriceCurrent: number;
  distributionPriceCurrent: number;
  productPriceCurrent: number;
  priceEffectiveFrom: string;
  currentSkuPriceCode: string | null;
}

export interface CurrentPricesResponse {
  hontisProductCode: string;
  productName: string;
  mrpCurrent: number;
  tradePriceCurrent: number;
  distributionPriceCurrent: number;
  productPriceCurrent: number;
  priceEffectiveFrom: string | null;
  currentSkuPriceCode: string | null;
}

export interface PriceHistoryResponse {
  priceHistoryId: number;
  hontisProductCode: string;
  priceTypeCode: string;
  priceValue: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  skuPriceCode: string;
  source: string | null;
  notes: string | null;
  createdOn: string;
  createdBy: string | null;
}

export interface DoctorListResponse {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  specialityCode: string;
  specialityName: string | null;
  doctorStatusCode: string;
  doctorStatusName: string | null;
  primaryCityCode: string | null;
  primaryCityName: string | null;
  phone: string | null;
  status: string;
  updatedOn: string | null;
}

export interface DoctorDetailResponse {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  specialityCode: string;
  specialityName: string | null;
  doctorStatusCode: string;
  doctorStatusName: string | null;
  primaryCityCode: string | null;
  primaryCityName: string | null;
  phone: string | null;
  email: string | null;
  onboardedOn: string | null;
  firstContactBy: string | null;
  notes: string | null;
  status: string;
  createdOn: string;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
}

export interface CreateDoctorRequest {
  doctorCode: string;
  doctorName: string;
  specialityCode: string;
  doctorStatusCode: string;
  primaryCityCode?: string;
  phone?: string;
  email?: string;
  onboardedOn?: string;
  firstContactBy?: string;
  notes?: string;
  status: string;
}

export interface UpdateDoctorRequest {
  doctorCode: string;
  doctorName: string;
  specialityCode: string;
  doctorStatusCode: string;
  primaryCityCode?: string;
  phone?: string;
  email?: string;
  onboardedOn?: string;
  firstContactBy?: string;
  notes?: string;
  status: string;
}

export interface SpecialityLookupResponse {
  specialityCode: string;
  specialityName: string;
}

export interface DoctorStatusLookupResponse {
  doctorStatusCode: string;
  doctorStatusName: string;
}

export interface GeoRegionLookupResponse {
  regionCode: string;
  regionName: string;
}

export interface GeoCityLookupResponse {
  cityCode: string;
  cityName: string;
  regionCode: string | null;
}

export interface GeoBrickLookupResponse {
  brickCode: string;
  brickName: string;
  cityCode: string | null;
}

export interface EmailFolderDto {
  name: string;
  fullName: string;
  unreadCount: number;
  totalCount: number;
}

export interface EmailAttachmentDto {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface EmailMessageSummaryDto {
  id: string;
  uniqueId: string;
  folder: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  previewText: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
}

export interface EmailMessageDetailDto {
  id: string;
  uniqueId: string;
  folder: string;
  fromName: string;
  fromEmail: string;
  toAddresses: string[];
  ccAddresses: string[];
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  date: string;
  isRead: boolean;
  attachments: EmailAttachmentDto[];
  inReplyTo: string | null;
  messageId: string | null;
}

export interface EmailPagedResult {
  items: EmailMessageSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SendEmailRequest {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
}

export interface ReplyEmailRequest {
  additionalTo: string[];
  cc: string[];
  bodyHtml: string;
  replyAll: boolean;
}

export interface ForwardEmailRequest {
  to: string[];
  cc: string[];
  bodyHtml: string;
}

export interface DraftListDto {
  emailDraftId: number;
  toRecipients: string;
  subject: string;
  createdOn: string;
  updatedOn: string | null;
}

export interface DraftDetailDto {
  emailDraftId: number;
  toRecipients: string;
  ccRecipients: string | null;
  bccRecipients: string | null;
  subject: string;
  bodyHtml: string | null;
  inReplyToMessageId: string | null;
  forwardOfMessageId: string | null;
  createdOn: string;
  updatedOn: string | null;
}

export interface SaveDraftRequest {
  toRecipients: string;
  ccRecipients?: string;
  bccRecipients?: string;
  subject: string;
  bodyHtml?: string;
  inReplyToMessageId?: string;
  forwardOfMessageId?: string;
}
