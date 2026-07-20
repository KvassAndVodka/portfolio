export function isAdminPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.DEV_ADMIN_BYPASS === "true";
}

export const adminPreviewUser = {
  name: "Admin Preview",
  email: "local-preview",
  image: null,
};
