import React from "react";
import { AuthContext } from "./authContext";
import { Routes, Route, Navigate } from "react-router-dom";
import SnackBar from "./components/SnackBar";
import PublicHeader from "./components/PublicHeader";
import TopHeader from "./components/TopHeader";
import AdminHeader from "./components/AdminHeader";
import ClientHeader from "./components/ClientHeader";
import AttorneyHeader from "./components/AttorneyHeader";
import LawFirmHeader from "./components/LawFirmHeader";

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminForgotPage from "./pages/AdminForgotPage";
import AdminResetPage from "./pages/AdminResetPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProfilePage from "./pages/AdminProfilePage";

import ClientLoginPage from "./pages/ClientLoginPage";
import ClientForgotPage from "./pages/ClientForgotPage";
import ClientResetPage from "./pages/ClientResetPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import ClientProfilePage from "./pages/ClientProfilePage";

import AttorneyLoginPage from "./pages/AttorneyLoginPage";
import AttorneyForgotPage from "./pages/AttorneyForgotPage";
import AttorneyResetPage from "./pages/AttorneyResetPage";
import AttorneyDashboardPage from "./pages/AttorneyDashboardPage";
import AttorneyProfilePage from "./pages/AttorneyProfilePage";

import LawFirmLoginPage from "./pages/LawFirmLoginPage";
import LawFirmForgotPage from "./pages/LawFirmForgotPage";
import LawFirmResetPage from "./pages/LawFirmResetPage";
import LawFirmDashboardPage from "./pages/LawFirmDashboardPage";
import LawFirmProfilePage from "./pages/LawFirmProfilePage";
import LawFirmSignUpPage from "./pages/LawFirmSignUpPage";
import LawFirmVerificationEmail from "./pages/LawFirmVerificationEmail";

import AdminStripeProductsListPage from "./pages/stripe/AdminStripeProductsListPage";
import AddAdminStripeProductPage from "./pages/stripe/AddAdminStripeProductPage";
import EditAdminStripeProductPage from "./pages/stripe/EditAdminStripeProductPage";
import AdminStripePricesListPage from "./pages/stripe/AdminStripePricesListPage";
import AdminStripeSubscriptionsListPage from "./pages/stripe/AdminStripeSubscriptionsListPage";
//import AdminStripeInvoicesListPage from "./pages/stripe/AdminStripeInvoicesListPage";
import AdminStripeInvoicesListPageV2 from "./pages/stripe/AdminStripeInvoicesListPageV2";
import AdminStripeOrdersListPage from "./pages/stripe/AdminStripeOrdersListPage";
import AddAdminStripePricePage from "./pages/stripe/AddAdminStripePricePage";
import EditAdminStripePricePage from "./pages/stripe/EditAdminStripePricePage";

//import UserBillingPage from "./pages/UserBillingPage";
import UserCheckoutCallback from "./pages/UserCheckoutCallback";
//import PublicStripePlansListing from "./pages/PublicStripePlansListing";

import AdminEmailListPage from "./pages/AdminEmailListPage";
import AddAdminEmailPage from "./pages/AddAdminEmailPage";

import EditAdminEmailPage from "./pages/EditAdminEmailPage";

import AdminClientHoursListPage from "./pages/AdminClientHoursListPage";
import AddAdminClientHoursPage from "./pages/AddAdminClientHoursPage";
import EditAdminClientHoursPage from "./pages/EditAdminClientHoursPage";

import AddLawFirmAssignClientPage from "./pages/AddLawFirmAssignClientPage";

import AdminUserListPage from "./pages/AdminUserListPage";
import AddAdminUserPage from "./pages/AddAdminUserPage";
import EditAdminUserPage from "./pages/EditAdminUserPage";
import ViewAdminUserPage from "./pages/ViewAdminUserPage";

import AdminDocumentsListPage from "./pages/AdminDocumentsListPage";

import AdminSubClientListPage from "./pages/AdminSubClientListPage";
import EditAdminSubClientPage from "./pages/EditAdminSubClientPage";

import AdminAttorneyListPage from "./pages/AdminAttorneyListPage";
import AddAdminAttorneyPage from "./pages/AddAdminAttorneyPage";
import EditAdminAttorneyPage from "./pages/EditAdminAttorneyPage";

import AdminLawFirmListPage from "./pages/AdminLawFirmListPage";
import AddAdminLawFirmPage from "./pages/AddAdminLawFirmPage";
import EditAdminLawFirmPage from "./pages/EditAdminLawFirmPage";

import AdminAssignLawFirmListPage from "./pages/AdminAssignLawFirmListPage";
import AddAdminAssignLawFirmPage from "./pages/AddAdminAssignLawFirmPage";

import AdminContractDocumentHoursListPage from "./pages/AdminContractDocumentHoursListPage";
import AddAdminContractDocumentHoursPage from "./pages/AddAdminContractDocumentHoursPage";
import EditAdminContractDocumentHoursPage from "./pages/EditAdminContractDocumentHoursPage";

import AdminContractListPage from "./pages/AdminContractListPage";
import AddAdminContractPage from "./pages/AddAdminContractPage";
import EditAdminContractPage from "./pages/EditAdminContractPage";

import AdminActivityLogListPage from "./pages/AdminActivityLogListPage";
import AddAdminActivityLogPage from "./pages/AddAdminActivityLogPage";
import EditAdminActivityLogPage from "./pages/EditAdminActivityLogPage";

// import AdminLawFirmClientListPage from "./pages/AdminLawFirmClientListPage";
// import AddAdminLawFirmClientPage from "./pages/AddAdminLawFirmClientPage";
// import EditAdminLawFirmClientPage from "./pages/EditAdminLawFirmClientPage";

import AdminClientListPage from "./pages/AdminClientListPage";
import AddAdminClientPage from "./pages/AddAdminClientPage";
import EditAdminClientPage from "./pages/EditAdminClientPage";
import ViewAdminClientPage from "./pages/ViewAdminClientPage";

import AdminInvoiceCronjobListPage from "./pages/AdminInvoiceCronjobListPage";
import AddAdminInvoiceCronjobPage from "./pages/AddAdminInvoiceCronjobPage";
import EditAdminInvoiceCronjobPage from "./pages/EditAdminInvoiceCronjobPage";

import AdminInvoiceListPage from "./pages/AdminInvoiceListPage";
import AddAdminInvoicePage from "./pages/AddAdminInvoicePage";
import EditAdminInvoicePage from "./pages/EditAdminInvoicePage";
import ViewAdminInvoicePage from "./pages/ViewAdminInvoicePage";

import AdminProjectListPage from "./pages/AdminProjectListPage";
import AddAdminProjectPage from "./pages/AddAdminProjectPage";
import EditAdminProjectPage from "./pages/EditAdminProjectPage";

import AdminPhotoListPage from "./pages/AdminPhotoListPage";
import AddAdminPhotoPage from "./pages/AddAdminPhotoPage";

import AdminClientRateListPage from "./pages/AdminClientRateListPage";
import AddAdminClientRatePage from "./pages/AddAdminClientRatePage";
import EditAdminClientRatePage from "./pages/EditAdminClientRatePage";

import AdminDocTypeListPage from "./pages/AdminDocTypeListPage";
import AddAdminDocTypePage from "./pages/AddAdminDocTypePage";
import EditAdminDocTypePage from "./pages/EditAdminDocTypePage";

import AdminContractTagListPage from "./pages/AdminContractTagListPage";
import AddAdminContractTagPage from "./pages/AddAdminContractTagPage";
import EditAdminContractTagPage from "./pages/EditAdminContractTagPage";

import AdminClientTagsListPage from "./pages/AdminClientTagsListPage";

import AdminCmsListPage from "./pages/AdminCmsListPage";
import AddAdminCmsPage from "./pages/AddAdminCmsPage";

import EditAdminCmsPage from "./pages/EditAdminCmsPage";

import AdminEmailTemplateListPage from "./pages/AdminEmailTemplateListPage";
import AddAdminEmailTemplatePage from "./pages/AddAdminEmailTemplatePage";
import EditAdminEmailTemplatePage from "./pages/EditAdminEmailTemplatePage";

import AdminTagListPage from "./pages/AdminTagListPage";
import AddAdminTagPage from "./pages/AddAdminTagPage";
import EditAdminTagPage from "./pages/EditAdminTagPage";

import ClientClientHoursListPage from "./pages/ClientClientHoursListPage";
import AddClientClientHoursPage from "./pages/AddClientClientHoursPage";
import EditClientClientHoursPage from "./pages/EditClientClientHoursPage";

import ClientLawFirmAttorneyListPage from "./pages/ClientLawFirmAttorneyListPage";
import AddClientLawFirmAttorneyPage from "./pages/AddClientLawFirmAttorneyPage";
import EditClientLawFirmAttorneyPage from "./pages/EditClientLawFirmAttorneyPage";

import ClientContractDocumentHoursListPage from "./pages/ClientContractDocumentHoursListPage";
import AddClientContractDocumentHoursPage from "./pages/AddClientContractDocumentHoursPage";
import EditClientContractDocumentHoursPage from "./pages/EditClientContractDocumentHoursPage";

import ClientContractListPage from "./pages/ClientContractListPage";
import AddClientContractPage from "./pages/AddClientContractPage";
import EditClientContractPage from "./pages/EditClientContractPage";

import ClientActivityLogListPage from "./pages/ClientActivityLogListPage";
import AddClientActivityLogPage from "./pages/AddClientActivityLogPage";
import EditClientActivityLogPage from "./pages/EditClientActivityLogPage";

import ClientLawFirmClientListPage from "./pages/ClientLawFirmClientListPage";
import AddClientLawFirmClientPage from "./pages/AddClientLawFirmClientPage";
import EditClientLawFirmClientPage from "./pages/EditClientLawFirmClientPage";

import ClientInvoiceCronjobListPage from "./pages/ClientInvoiceCronjobListPage";
import AddClientInvoiceCronjobPage from "./pages/AddClientInvoiceCronjobPage";
import EditClientInvoiceCronjobPage from "./pages/EditClientInvoiceCronjobPage";

import ClientInvoiceListPage from "./pages/ClientInvoiceListPage";
import AddClientInvoicePage from "./pages/AddClientInvoicePage";
import EditClientInvoicePage from "./pages/EditClientInvoicePage";

import ClientProjectListPage from "./pages/ClientProjectListPage";
import AddClientProjectPage from "./pages/AddClientProjectPage";
import EditClientProjectPage from "./pages/EditClientProjectPage";

import ClientClientRateListPage from "./pages/ClientClientRateListPage";
import AddClientClientRatePage from "./pages/AddClientClientRatePage";
import EditClientClientRatePage from "./pages/EditClientClientRatePage";

import ClientDocTypeListPage from "./pages/ClientDocTypeListPage";
import AddClientDocTypePage from "./pages/AddClientDocTypePage";
import EditClientDocTypePage from "./pages/EditClientDocTypePage";

import ClientContractTagListPage from "./pages/ClientContractTagListPage";
import AddClientContractTagPage from "./pages/AddClientContractTagPage";
import EditClientContractTagPage from "./pages/EditClientContractTagPage";

import ClientEmailTemplateListPage from "./pages/ClientEmailTemplateListPage";
import AddClientEmailTemplatePage from "./pages/AddClientEmailTemplatePage";
import EditClientEmailTemplatePage from "./pages/EditClientEmailTemplatePage";

import ClientTagListPage from "./pages/ClientTagListPage";
import AddClientTagPage from "./pages/AddClientTagPage";
import EditClientTagPage from "./pages/EditClientTagPage";

import AttorneyClientHoursListPage from "./pages/AttorneyClientHoursListPage";
import AddAttorneyClientHoursPage from "./pages/AddAttorneyClientHoursPage";
import EditAttorneyClientHoursPage from "./pages/EditAttorneyClientHoursPage";

import AttorneyLawFirmAttorneyListPage from "./pages/AttorneyLawFirmAttorneyListPage";
import AddAttorneyLawFirmAttorneyPage from "./pages/AddAttorneyLawFirmAttorneyPage";
import EditAttorneyLawFirmAttorneyPage from "./pages/EditAttorneyLawFirmAttorneyPage";

import AttorneyContractDocumentHoursListPage from "./pages/AttorneyContractDocumentHoursListPage";
import AddAttorneyContractDocumentHoursPage from "./pages/AddAttorneyContractDocumentHoursPage";
import EditAttorneyContractDocumentHoursPage from "./pages/EditAttorneyContractDocumentHoursPage";

import AttorneyContractListPage from "./pages/AttorneyContractListPage";
import AddAttorneyContractPage from "./pages/AddAttorneyContractPage";
import EditAttorneyContractPage from "./pages/EditAttorneyContractPage";

import AttorneyActivityLogListPage from "./pages/AttorneyActivityLogListPage";
import AddAttorneyActivityLogPage from "./pages/AddAttorneyActivityLogPage";
import EditAttorneyActivityLogPage from "./pages/EditAttorneyActivityLogPage";

import AttorneyLawFirmClientListPage from "./pages/AttorneyLawFirmClientListPage";
import AddAttorneyLawFirmClientPage from "./pages/AddAttorneyLawFirmClientPage";
import EditAttorneyLawFirmClientPage from "./pages/EditAttorneyLawFirmClientPage";

import AttorneyInvoiceCronjobListPage from "./pages/AttorneyInvoiceCronjobListPage";
import AddAttorneyInvoiceCronjobPage from "./pages/AddAttorneyInvoiceCronjobPage";
import EditAttorneyInvoiceCronjobPage from "./pages/EditAttorneyInvoiceCronjobPage";

import AttorneyInvoiceListPage from "./pages/AttorneyInvoiceListPage";
import AddAttorneyInvoicePage from "./pages/AddAttorneyInvoicePage";
import EditAttorneyInvoicePage from "./pages/EditAttorneyInvoicePage";

import AttorneyProjectListPage from "./pages/AttorneyProjectListPage";
import AddAttorneyProjectPage from "./pages/AddAttorneyProjectPage";
import EditAttorneyProjectPage from "./pages/EditAttorneyProjectPage";

import AttorneyClientRateListPage from "./pages/AttorneyClientRateListPage";
import AddAttorneyClientRatePage from "./pages/AddAttorneyClientRatePage";
import EditAttorneyClientRatePage from "./pages/EditAttorneyClientRatePage";

import AttorneyDocTypeListPage from "./pages/AttorneyDocTypeListPage";
import AddAttorneyDocTypePage from "./pages/AddAttorneyDocTypePage";
import EditAttorneyDocTypePage from "./pages/EditAttorneyDocTypePage";

import AttorneyContractTagListPage from "./pages/AttorneyContractTagListPage";
import AddAttorneyContractTagPage from "./pages/AddAttorneyContractTagPage";
import EditAttorneyContractTagPage from "./pages/EditAttorneyContractTagPage";

import AttorneyEmailTemplateListPage from "./pages/AttorneyEmailTemplateListPage";
import AddAttorneyEmailTemplatePage from "./pages/AddAttorneyEmailTemplatePage";
import EditAttorneyEmailTemplatePage from "./pages/EditAttorneyEmailTemplatePage";

import AttorneyTagListPage from "./pages/AttorneyTagListPage";
import AddAttorneyTagPage from "./pages/AddAttorneyTagPage";
import EditAttorneyTagPage from "./pages/EditAttorneyTagPage";

import LawFirmClientHoursListPage from "./pages/LawFirmClientHoursListPage";
import LawFirmAddClientHoursPage from "./pages/LawFirmAddClientHoursPage";
import EditLawFirmClientHoursPage from "./pages/EditLawFirmClientHoursPage";

import LawFirmLawFirmAttorneyListPage from "./pages/LawFirmLawFirmAttorneyListPage";
import AddLawFirmLawFirmAttorneyPage from "./pages/AddLawFirmLawFirmAttorneyPage";
import EditLawFirmLawFirmAttorneyPage from "./pages/EditLawFirmLawFirmAttorneyPage";

import LawFirmContractDocumentHoursListPage from "./pages/LawFirmContractDocumentHoursListPage";
import AddLawFirmContractDocumentHoursPage from "./pages/AddLawFirmContractDocumentHoursPage";
import EditLawFirmContractDocumentHoursPage from "./pages/EditLawFirmContractDocumentHoursPage";

import LawFirmContractListPage from "./pages/LawFirmContractListPage";
import AddLawFirmContractPage from "./pages/AddLawFirmContractPage";
import EditLawFirmContractPage from "./pages/EditLawFirmContractPage";

import LawFirmActivityLogListPage from "./pages/LawFirmActivityLogListPage";
import AddLawFirmActivityLogPage from "./pages/AddLawFirmActivityLogPage";
import EditLawFirmActivityLogPage from "./pages/EditLawFirmActivityLogPage";

import LawFirmLawFirmClientListPage from "./pages/LawFirmLawFirmClientListPage";
import AddLawFirmLawFirmClientPage from "./pages/AddLawFirmLawFirmClientPage";
import EditLawFirmLawFirmClientPage from "./pages/EditLawFirmLawFirmClientPage";

import LawFirmInvoiceCronjobListPage from "./pages/LawFirmInvoiceCronjobListPage";
import AddLawFirmInvoiceCronjobPage from "./pages/AddLawFirmInvoiceCronjobPage";
import EditLawFirmInvoiceCronjobPage from "./pages/EditLawFirmInvoiceCronjobPage";

import LawFirmInvoiceListPage from "./pages/LawFirmInvoiceListPage";
import AddLawFirmInvoicePage from "./pages/AddLawFirmInvoicePage";
import EditLawFirmInvoicePage from "./pages/EditLawFirmInvoicePage";

import LawFirmProjectListPage from "./pages/LawFirmProjectListPage";
import AddLawFirmProjectPage from "./pages/AddLawFirmProjectPage";
import EditLawFirmProjectPage from "./pages/EditLawFirmProjectPage";

import LawFirmClientRateListPage from "./pages/LawFirmClientRateListPage";
import AddLawFirmClientRatePage from "./pages/AddLawFirmClientRatePage";
import EditLawFirmClientRatePage from "./pages/EditLawFirmClientRatePage";

import LawFirmDocTypeListPage from "./pages/LawFirmDocTypeListPage";
import AddLawFirmDocTypePage from "./pages/AddLawFirmDocTypePage";
import EditLawFirmDocTypePage from "./pages/EditLawFirmDocTypePage";

import LawFirmContractTagListPage from "./pages/LawFirmContractTagListPage";
import AddLawFirmContractTagPage from "./pages/AddLawFirmContractTagPage";
import EditLawFirmContractTagPage from "./pages/EditLawFirmContractTagPage";

import LawFirmEmailTemplateListPage from "./pages/LawFirmEmailTemplateListPage";
import AddLawFirmEmailTemplatePage from "./pages/AddLawFirmEmailTemplatePage";
import EditLawFirmEmailTemplatePage from "./pages/EditLawFirmEmailTemplatePage";

import LawFirmTagListPage from "./pages/LawFirmTagListPage";
import AddLawFirmTagPage from "./pages/AddLawFirmTagPage";
import EditLawFirmTagPage from "./pages/EditLawFirmTagPage";
import ClientSignUpPage from "./pages/ClientSignUpPage";
import ClientExecutedContractsListPage from "./pages/ClientExecutedContractsListPage";
import ClientPendingContractsListPage from "./pages/ClientPendingContractsListPage";
import ClientDocumentUploadListPage from "./pages/ClientDocumentUploadListPage";
import ClientBillingPage from "./pages/ClientBillingPage";
import ClientBillingDetailsPage from "./pages/ClientBillingDetailsPage";
import ClientPaymentMethodPage from "./pages/ClientPaymentMethodPage";
import ClientDocumentEditListPage from "./pages/ClientDocumentEditListPage";
import ClientContractsDocumentUploadListPage from "./pages/ClientContractsDocumentUploadListPage";
import AttorneyPendingContractsListPage from "./pages/AttorneyPendingContractsListPage";
import AttorneyContractsDetailsListPage from "./pages/AttorneyContractsDetailsListPage";
import AttorneyExecutedContractsListPage from "./pages/AttorneyExecutedContractsListPage";
import AttorneyUploadDocumentListPage from "./pages/AttorneyUploadDocumentListPage";
import AttorneyContractsActivityLogListPage from "./pages/AttorneyContractsActivityLogListPage";
import AttorneyAddHoursLogListPage from "./pages/AttorneyAddHoursLogListPage";
import AttorneyClientListPage from "./pages/AttorneyClientListPage";
import AttorneyClientUpdatePlaybookListPage from "./pages/AttorneyClientUpdatePlaybookListPage";
import AttorneyProjectsListPage from "./pages/AttorneyProjectsListPage";
import ClientPaymentPage from "./pages/ClientPaymentPage";
import AttorneyLicenseListPage from "./pages/AttorneyLicenseListPage";
import ClientVerificationModal from "./pages/ClientVerificationModal";
import ClientVerificationEmail from "./pages/ClientVerificationEmail";
import AttorneySignUpPage from "./pages/AttorneySignUpPage";
import AttorneyVerificationEmail from "./pages/AttorneyVerificationEmail";
import AttorneyCounterPatyEmail from "./pages/AttorneyCounterPatyEmail";
import AttorneyEditDocumentListPage from "./pages/AttorneyEditDocumentListPage";
import AttorneyViewDocumentsListPage from "./pages/AttorneyViewDocumentsListPage";
import ClientViewDocumentsListPage from "./pages/ClientViewDocumentsListPage";
import AttorneyViewExecutedDocumentsListPage from "./pages/AttorneyViewExecutedDocumentsListPage";
import AttorneyContractsDocumentUploadListPage from "./pages/AttorneyContractsDocumentUploadListPage";
import ClientViewExecutedDocumentsListPage from "./pages/ClientViewExecutedDocumentsListPage";

import LawFirmPendingContractsListPage from "./pages/LawFirmPendingContractsListPage";
import LawFirmExecutedContractsListPage from "./pages/LawFirmExecutedContractsListPage";
import LawFirmAddHoursLogListPage from "./pages/LawFirmAddHoursLogListPage";
import LawFirmClientListPage from "./pages/LawFirmClientListPage";
import LawFirmProjectsListPage from "./pages/LawFirmProjectsListPage";
import LawFirmAttorneysListPage from "./pages/LawFirmAttorneysListPage";
import LawFirmUploadDocumentListPage from "./pages/LawFirmUploadDocumentListPage";
import LawFirmViewDocumentsListPage from "./pages/LawFirmViewDocumentsListPage";
import LawFirmViewExecutedDocumentsListPage from "./pages/LawFirmViewExecutedDocumentsListPage";
import SubClientSignUpPage from "./pages/SubClientSignUpPage";
import SubclientLoginPage from "./pages/SubclientLoginPage";
import SubclientHeader from "./components/SubclientHeader";
import SubclientDocumentUploadListPage from "./pages/SubclientDocumentUploadListPage";
import SubclientExecutedContractsListPage from "./pages/SubclientExecutedContractsListPage";
import SubclientPendingContractsListPage from "./pages/SubclientPendingContractsListPage";
import SubclientViewDocumentsListPage from "./pages/SubclientViewDocumentsListPage";
import SubclientBillingPage from "./pages/SubclientBillingPage";
import AttorneyViewPlaybookListPage from "./pages/AttorneyViewPlaybookListPage";
import AttorneyPlaybookUploadListPage from "./pages/AttorneyPlaybookUploadListPage";
import AttorneyViewNDAListPage from "./pages/AttorneyViewNDAListPage";
import AttorneyNADUploadListPage from "./pages/AttorneyNADUploadListPage";
import LawfirmContractsActivityLogListPage from "./pages/LawfirmContractsActivityLogListPage";
import LawfirmCounterPatyEmail from "./pages/LawfirmCounterPatyEmail";
import LawfirmEditDocumentListPage from "./pages/LawfirmEditDocumentListPage";
import LawfirmViewPlaybookListPage from "./pages/LawfirmViewPlaybookListPage";
import LawfirmViewNDAListPage from "./pages/LawfirmViewNDAListPage";
import LawfirmViewClientPlaybookListPage from "./pages/LawfirmViewClientPlaybookListPage";
import LawfirmClientPlaybookUploadListPage from "./pages/LawfirmClientPlaybookUploadListPage";
import LawFirmInvoiceDetailsPage from "./pages/LawFirmInvoiceDetailsPage";
import AdminDocumentClientTagsListPage from "./pages/AdminDocumentClientTagsListPage";
import SubclientVerificationEmail from "./pages/SubclientVerificationEmail";
import LawFirmSubClientListPage from "./pages/LawFirmSubClientListPage";
import EditLawFirmSubClientPage from "./pages/EditLawFirmSubClientPage";
import AttorneyClientUpdateNdaListPage from "./pages/AttorneyClientUpdateNdaListPage";
import LawfirmClientUpdatePlaybookListPage from "./pages/LawfirmClientUpdatePlaybookListPage";
import AdminCustomReportingPage from "./pages/AdminCustomReportingPage";
import AdminLoginPage2FA from "./pages/AdminLoginPage2FA";
import AdminLoginPage2FAWithToken from "./pages/AdminLoginPage2FAWithToken";
import AdminViewDocumentsListPage from "./pages/AdminViewDocumentsListPage";
import { GlobalContext } from "./globalContext";
import SubclientForgotPage from "./pages/SubclientForgotPage";
import SubclientResetPage from "./pages/SubclientResetPage";
import AdminViewExecutedDocumentsListPage from "./pages/AdminViewExecutedDocumentsListPage";
import SnackBarV2 from "./components/SnackBarv2";
import EditSubclientContractPage from "./pages/EditSubclientContractPage";
import ViewLawFirmAttorneyAssignedClients from "./pages/ViewLawFirmAttorneyAssignedClients";
import ClientDocumentClientTagsListPage from "./pages/ClientDocumentClientTagsListPage";
import SubClientDocumentClientTagsListPage from "./pages/SubClientDocumentClientTagsListPage";
import AttorneyContractsDocumentUploadEditPage from "./pages/AttorneyContractsDocumentUploadEditPage";
import LawfirmContractsDocumentUploadEditPage from "./pages/LawfirmContractsDocumentUploadEditPage";
import LawFirmUploadDocument from "./pages/LawFirmUploadDocument";
import SubclientDashboardPage from "./pages/SubclientDashboardPage";
import AttorneyUploadDocument from "./pages/AttorneyUploadDocument";
import LawfirmDocumentsListPage from "./pages/LawfirmDocumentLists";
import AttorneyDocumentsListPage from "./pages/AttorneyDocuments";

function renderHeader(role) {
  switch (role) {
    case "admin":
      return <AdminHeader />;

    case "client":
      return <ClientHeader />;
    case "subclient":
      return <SubclientHeader />;

    case "attorney":
      return <AttorneyHeader />;

    case "lawfirm":
      return <LawFirmHeader />;

    default:
      return <PublicHeader />;
  }
}

function renderRoutes(role) {
  switch (role) {
    case "admin":
      return (
        <Routes>
          <Route exact path="/admin" element={<AdminDashboardPage />}></Route>
          <Route
            exact
            path="/admin/dashboard"
            element={<AdminDashboardPage />}
          ></Route>
          <Route
            exact
            path="/admin/subclient"
            element={<AdminSubClientListPage />}
          ></Route>
          <Route
            exact
            path="/admin/edit-subclient/:id"
            element={<EditAdminSubClientPage />}
          ></Route>
          <Route
            exact
            path="/admin/profile"
            element={<AdminProfilePage />}
          ></Route>

          <Route path="/admin/email" element={<AdminEmailListPage />}></Route>
          <Route
            path="/admin/add-email"
            element={<AddAdminEmailPage />}
          ></Route>
          <Route
            path="/admin/edit-email/:id"
            element={<EditAdminEmailPage />}
          ></Route>

          <Route
            path="/admin/client_hours"
            element={<AdminClientHoursListPage />}
          ></Route>

          <Route
            path="/admin/add-client_hours"
            element={<AddAdminClientHoursPage />}
          ></Route>
          <Route
            path="/admin/edit-client_hours/:id"
            element={<EditAdminClientHoursPage />}
          ></Route>

          <Route path="/admin/user" element={<AdminUserListPage />}></Route>
          <Route path="/admin/add-user" element={<AddAdminUserPage />}></Route>
          <Route
            path="/admin/edit-user/:id"
            element={<EditAdminUserPage />}
          ></Route>
          <Route
            path="/admin/view-user/:id"
            element={<ViewAdminUserPage />}
          ></Route>

          <Route
            path="/admin/law_firm"
            element={<AdminLawFirmListPage />}
          ></Route>
          <Route
            path="/admin/add-law_firm"
            element={<AddAdminLawFirmPage />}
          ></Route>
          <Route
            path="/admin/edit-law_firm/:id"
            element={<EditAdminLawFirmPage />}
          ></Route>

          <Route
            path="/admin/assign_law_firm/:id"
            element={<AdminAssignLawFirmListPage />}
          ></Route>
          <Route
            path="/admin/add-assign_law_firm/:id"
            element={<AddAdminAssignLawFirmPage />}
          ></Route>

          <Route
            path="/admin/attorney"
            element={<AdminAttorneyListPage />}
          ></Route>
          <Route
            path="/admin/add-attorney"
            element={<AddAdminAttorneyPage />}
          ></Route>
          <Route
            path="/admin/edit-attorney/:id"
            element={<EditAdminAttorneyPage />}
          ></Route>

          <Route
            path="/admin/documents"
            element={<AdminDocumentsListPage />}
          ></Route>
          <Route
            path="/admin/documents/:id"
            element={<AdminViewDocumentsListPage />}
          ></Route>
          <Route
            path="/admin/executed_documents/:id"
            element={<AdminViewExecutedDocumentsListPage />}
          ></Route>

          <Route
            path="/admin/contract_document_hours"
            element={<AdminContractDocumentHoursListPage />}
          ></Route>
          <Route
            path="/admin/add-contract_document_hours"
            element={<AddAdminContractDocumentHoursPage />}
          ></Route>
          <Route
            path="/admin/edit-contract_document_hours/:id"
            element={<EditAdminContractDocumentHoursPage />}
          ></Route>

          <Route
            path="/admin/contract"
            element={<AdminContractListPage />}
          ></Route>
          <Route
            path="/admin/add-contract"
            element={<AddAdminContractPage />}
          ></Route>
          <Route
            path="/admin/edit-contract/:id"
            element={<EditAdminContractPage />}
          ></Route>
          <Route
            path="/admin/custom-reporting"
            element={<AdminCustomReportingPage />}
          ></Route>
          <Route
            path="/admin/activity_log"
            element={<AdminActivityLogListPage />}
          ></Route>
          <Route
            path="/admin/add-activity_log"
            element={<AddAdminActivityLogPage />}
          ></Route>
          <Route
            path="/admin/edit-activity_log/:id"
            element={<EditAdminActivityLogPage />}
          ></Route>

          <Route path="/admin/client" element={<AdminClientListPage />}></Route>
          <Route
            path="/admin/add-client"
            element={<AddAdminClientPage />}
          ></Route>
          <Route
            path="/admin/edit-client/:id"
            element={<EditAdminClientPage />}
          ></Route>
          <Route
            path="/admin/view-client/:id"
            element={<ViewAdminClientPage />}
          ></Route>

          <Route
            path="/admin/invoice_cronjob"
            element={<AdminInvoiceCronjobListPage />}
          ></Route>
          <Route
            path="/admin/add-invoice_cronjob"
            element={<AddAdminInvoiceCronjobPage />}
          ></Route>
          <Route
            path="/admin/edit-invoice_cronjob/:id"
            element={<EditAdminInvoiceCronjobPage />}
          ></Route>

          <Route
            path="/admin/invoice"
            element={<AdminInvoiceListPage />}
          ></Route>
          <Route
            path="/admin/add-invoice"
            element={<AddAdminInvoicePage />}
          ></Route>
          <Route
            path="/admin/edit-invoice/:id"
            element={<EditAdminInvoicePage />}
          ></Route>
          <Route
            path="/admin/view-invoice/:id"
            element={<ViewAdminInvoicePage />}
          ></Route>

          <Route
            path="/admin/project"
            element={<AdminProjectListPage />}
          ></Route>
          <Route
            path="/admin/add-project"
            element={<AddAdminProjectPage />}
          ></Route>
          <Route
            path="/admin/edit-project/:id"
            element={<EditAdminProjectPage />}
          ></Route>

          <Route path="/admin/photo" element={<AdminPhotoListPage />}></Route>
          <Route
            path="/admin/add-photo"
            element={<AddAdminPhotoPage />}
          ></Route>

          <Route
            path="/admin/view-client_rate/:id"
            element={<AdminClientRateListPage />}
          ></Route>
          <Route
            path="/admin/add-client_rate"
            element={<AddAdminClientRatePage />}
          ></Route>
          <Route
            path="/admin/edit-client_rate/:id"
            element={<EditAdminClientRatePage />}
          ></Route>

          <Route
            path="/admin/doc_type"
            element={<AdminDocTypeListPage />}
          ></Route>
          <Route
            path="/admin/add-doc_type"
            element={<AddAdminDocTypePage />}
          ></Route>
          <Route
            path="/admin/edit-doc_type/:id"
            element={<EditAdminDocTypePage />}
          ></Route>

          <Route
            path="/admin/client_tags/:id"
            element={<AdminClientTagsListPage />}
          ></Route>

          <Route
            path="/admin/document_client_tags/:id"
            element={<AdminDocumentClientTagsListPage />}
          ></Route>

          <Route
            path="/admin/contract_tag"
            element={<AdminContractTagListPage />}
          ></Route>
          <Route
            path="/admin/add-contract_tag"
            element={<AddAdminContractTagPage />}
          ></Route>
          <Route
            path="/admin/edit-contract_tag/:id"
            element={<EditAdminContractTagPage />}
          ></Route>

          <Route path="/admin/cms" element={<AdminCmsListPage />}></Route>
          <Route path="/admin/add-cms" element={<AddAdminCmsPage />}></Route>
          <Route
            path="/admin/edit-cms/:id"
            element={<EditAdminCmsPage />}
          ></Route>

          <Route
            path="/admin/email_template"
            element={<AdminEmailTemplateListPage />}
          ></Route>
          <Route
            path="/admin/add-email_template"
            element={<AddAdminEmailTemplatePage />}
          ></Route>
          <Route
            path="/admin/edit-email_template/:id"
            element={<EditAdminEmailTemplatePage />}
          ></Route>

          <Route path="/admin/tag" element={<AdminTagListPage />}></Route>
          <Route path="/admin/add-tag" element={<AddAdminTagPage />}></Route>
          <Route
            path="/admin/edit-tag/:id"
            element={<EditAdminTagPage />}
          ></Route>

          <Route
            path="/admin/edit-product/:id"
            element={<EditAdminStripeProductPage />}
          ></Route>
          <Route
            path="/admin/edit-price/:id"
            element={<EditAdminStripePricePage />}
          ></Route>
          <Route
            path="/admin/add-product"
            element={<AddAdminStripeProductPage />}
          ></Route>
          <Route
            path="/admin/add-price"
            element={<AddAdminStripePricePage />}
          ></Route>
          <Route
            path="/admin/products"
            element={<AdminStripeProductsListPage />}
          ></Route>
          <Route
            path="/admin/prices"
            element={<AdminStripePricesListPage />}
          ></Route>
          <Route
            path="/admin/subscriptions"
            element={<AdminStripeSubscriptionsListPage />}
          ></Route>
          <Route
            path="/admin/invoices"
            element={<AdminStripeInvoicesListPageV2 />}
          ></Route>
          <Route
            path="/admin/orders"
            element={<AdminStripeOrdersListPage />}
          ></Route>
          <Route path="*" element={<Navigate to="/admin" />}></Route>
        </Routes>
      );
      break;

    case "client":
      return (
        <Routes>
          <Route exact path="/client" element={<ClientDashboardPage />}></Route>
          <Route
            exact
            path="/client/dashboard"
            element={<ClientDashboardPage />}
          ></Route>
          {/* 
          <Route
            path="/client/client_hours"
            element={<ClientClientHoursListPage />}
          ></Route>
          <Route
            path="/client/add-client_hours"
            element={<AddClientClientHoursPage />}
          ></Route>
          <Route
            path="/client/edit-client_hours/:id"
            element={<EditClientClientHoursPage />}
          ></Route>

          <Route
            path="/client/law_firm_attorney"
            element={<ClientLawFirmAttorneyListPage />}
          ></Route>
          <Route
            path="/client/add-law_firm_attorney"
            element={<AddClientLawFirmAttorneyPage />}
          ></Route>
          <Route
            path="/client/edit-law_firm_attorney/:id"
            element={<EditClientLawFirmAttorneyPage />}
          ></Route>

          <Route
            path="/client/contract_document_hours"
            element={<ClientContractDocumentHoursListPage />}
          ></Route>
          <Route
            path="/client/add-contract_document_hours"
            element={<AddClientContractDocumentHoursPage />}
          ></Route>
          <Route
            path="/client/edit-contract_document_hours/:id"
            element={<EditClientContractDocumentHoursPage />}
          ></Route>

          <Route
            path="/client/contract"
            element={<ClientContractListPage />}
          ></Route>
          <Route
            path="/client/add-contract"
            element={<AddClientContractPage />}
          ></Route>
          <Route
            path="/client/edit-contract/:id"
            element={<EditClientContractPage />}
          ></Route>

          <Route
            path="/client/activity_log"
            element={<ClientActivityLogListPage />}
          ></Route>
          <Route
            path="/client/add-activity_log"
            element={<AddClientActivityLogPage />}
          ></Route>
          <Route
            path="/client/edit-activity_log/:id"
            element={<EditClientActivityLogPage />}
          ></Route>

          <Route
            path="/client/law_firm_client"
            element={<ClientLawFirmClientListPage />}
          ></Route>
          <Route
            path="/client/add-law_firm_client"
            element={<AddClientLawFirmClientPage />}
          ></Route>
          <Route
            path="/client/edit-law_firm_client/:id"
            element={<EditClientLawFirmClientPage />}
          ></Route>

          <Route
            path="/client/invoice_cronjob"
            element={<ClientInvoiceCronjobListPage />}
          ></Route>
          <Route
            path="/client/add-invoice_cronjob"
            element={<AddClientInvoiceCronjobPage />}
          ></Route>
          <Route
            path="/client/edit-invoice_cronjob/:id"
            element={<EditClientInvoiceCronjobPage />}
          ></Route>

          <Route
            path="/client/invoice"
            element={<ClientInvoiceListPage />}
          ></Route>
          <Route
            path="/client/add-invoice"
            element={<AddClientInvoicePage />}
          ></Route>
          <Route
            path="/client/edit-invoice/:id"
            element={<EditClientInvoicePage />}
          ></Route>

          <Route
            path="/client/project"
            element={<ClientProjectListPage />}
          ></Route>
          <Route
            path="/client/add-project"
            element={<AddClientProjectPage />}
          ></Route>
          <Route
            path="/client/edit-project/:id"
            element={<EditClientProjectPage />}
          ></Route>

          <Route
            path="/client/client_rate"
            element={<ClientClientRateListPage />}
          ></Route>
          <Route
            path="/client/add-client_rate"
            element={<AddClientClientRatePage />}
          ></Route>
          <Route
            path="/client/edit-client_rate/:id"
            element={<EditClientClientRatePage />}
          ></Route>

          <Route
            path="/client/doc_type"
            element={<ClientDocTypeListPage />}
          ></Route>
          <Route
            path="/client/add-doc_type"
            element={<AddClientDocTypePage />}
          ></Route>
          <Route
            path="/client/edit-doc_type/:id"
            element={<EditClientDocTypePage />}
          ></Route>

          <Route
            path="/client/contract_tag"
            element={<ClientContractTagListPage />}
          ></Route> */}

          <Route
            path="/client/document_client_tags/:id"
            element={<ClientDocumentClientTagsListPage />}
          ></Route>

          <Route
            path="/client/executed_contracts"
            element={<ClientExecutedContractsListPage />}
          ></Route>
          <Route
            path="/client/pending_contracts"
            element={<ClientPendingContractsListPage />}
          ></Route>
          <Route
            path="/client/edit-contract/:id"
            element={<EditClientContractPage />}
          ></Route>
          <Route
            path="/client/document_upload"
            element={<ClientDocumentUploadListPage />}
          ></Route>
          <Route
            path="/client/view_document/:id"
            element={<ClientViewDocumentsListPage />}
          ></Route>
          {/* <Route
            path="/client/contracts_document_update/:id/:doc"
            element={<ClientContractsDocumentUploadListPage />}
          ></Route> */}
          <Route
            path="/client/view_executed_document/:id"
            element={<ClientViewExecutedDocumentsListPage />}
          ></Route>
          <Route
            path="/client/edit_contracts/:id"
            element={<ClientDocumentEditListPage />}
          ></Route>
          <Route path="/client/billing" element={<ClientBillingPage />}></Route>
          <Route
            path="/client/billing/:id"
            element={<ClientBillingDetailsPage />}
          ></Route>
          <Route path="/client/pay/:id" element={<ClientPaymentPage />}></Route>
          <Route
            path="/client/payment_method"
            element={<ClientPaymentMethodPage />}
          ></Route>
          <Route
            exact
            path="/client/profile"
            element={<ClientProfilePage />}
          ></Route>
          {/* <Route
            path="/client/add-contract_tag"
            element={<AddClientContractTagPage />}
          ></Route>
          <Route
            path="/client/edit-contract_tag/:id"
            element={<EditClientContractTagPage />}
          ></Route>

          <Route
            path="/client/email_template"
            element={<ClientEmailTemplateListPage />}
          ></Route>
          <Route
            path="/client/add-email_template"
            element={<AddClientEmailTemplatePage />}
          ></Route>
          <Route
            path="/client/edit-email_template/:id"
            element={<EditClientEmailTemplatePage />}
          ></Route>

          <Route path="/client/tag" element={<ClientTagListPage />}></Route>
          <Route path="/client/add-tag" element={<AddClientTagPage />}></Route>
          <Route
            path="/client/edit-tag/:id"
            element={<EditClientTagPage />}
          ></Route> */}

          {/*<Route path="/user/billing" element={<UserBillingPage />} ></Route>*/}
          {/* <Route
            path="/user/checkout"
            element={<UserCheckoutCallback />}
          ></Route> */}
          {/*<Route exact path="/plans" element={<PublicStripePlansListing />}></Route>*/}
          <Route path="*" element={<Navigate to="/client" />}></Route>
        </Routes>
      );
      break;
    case "subclient":
      return (
        <Routes>
          <Route
            exact
            path="/subclient"
            element={<SubclientDashboardPage />}
          ></Route>
          {/* <Route
            exact
            path="/subclient/dashboard"
            element={<ClientProfilePage />}
          ></Route> */}

          <Route
            path="/subclient/executed_contracts"
            element={<SubclientExecutedContractsListPage />}
          ></Route>
          <Route
            path="/subclient/pending_contracts"
            element={<SubclientPendingContractsListPage />}
          ></Route>
          <Route
            path="/subclient/edit-contract/:id"
            element={<EditSubclientContractPage />}
          ></Route>

          <Route
            path="/subclient/document_client_tags/:id"
            element={<SubClientDocumentClientTagsListPage />}
          ></Route>

          <Route
            path="/subclient/document_upload"
            element={<SubclientDocumentUploadListPage />}
          ></Route>
          <Route
            path="/subclient/view_document/:id"
            element={<SubclientViewDocumentsListPage />}
          ></Route>
          {/* <Route
            path="/subclient/contracts_document_update/:id/:doc"
            element={<ClientContractsDocumentUploadListPage />}
          ></Route> */}
          <Route
            path="/subclient/view_executed_document/:id"
            element={<ClientViewExecutedDocumentsListPage />}
          ></Route>
          <Route
            path="/subclient/edit_contracts/:id"
            element={<ClientDocumentEditListPage />}
          ></Route>
          <Route
            path="/subclient/billing"
            element={<SubclientBillingPage />}
          ></Route>
          <Route
            path="/subclient/billing/:id"
            element={<ClientBillingDetailsPage />}
          ></Route>
          <Route
            path="/subclient/pay/:id"
            element={<ClientPaymentPage />}
          ></Route>
          <Route
            path="/subclient/payment_method"
            element={<ClientPaymentMethodPage />}
          ></Route>
          <Route
            exact
            path="/subclient/profile"
            element={<ClientProfilePage />}
          ></Route>

          <Route path="*" element={<Navigate to="/subclient" />}></Route>
        </Routes>
      );
      break;

    case "attorney":
      return (
        <Routes>
          <Route
            exact
            path="/attorney"
            element={<AttorneyProfilePage />}
          ></Route>
          {/* <Route
            exact
            path="/attorney"
            element={<AttorneyDashboardPage />}
          ></Route>
          <Route
            exact
            path="/attorney/dashboard"
            element={<AttorneyDashboardPage />}
          ></Route> */}
          <Route
            exact
            path="/attorney/profile"
            element={<AttorneyProfilePage />}
          ></Route>
          <Route
            path="/attorney/license"
            element={<AttorneyLicenseListPage />}
          ></Route>

          {/*
          <Route
            path="/attorney/add-client_hours"
            element={<AddAttorneyClientHoursPage />}
          ></Route>
         

          <Route
            path="/attorney/law_firm_attorney"
            element={<AttorneyLawFirmAttorneyListPage />}
          ></Route>
          <Route
            path="/attorney/add-law_firm_attorney"
            element={<AddAttorneyLawFirmAttorneyPage />}
          ></Route>
          <Route
            path="/attorney/edit-law_firm_attorney/:id"
            element={<EditAttorneyLawFirmAttorneyPage />}
          ></Route>

          <Route
            path="/attorney/contract_document_hours"
            element={<AttorneyContractDocumentHoursListPage />}
          ></Route>
          <Route
            path="/attorney/add-contract_document_hours"
            element={<AddAttorneyContractDocumentHoursPage />}
          ></Route>
          <Route
            path="/attorney/edit-contract_document_hours/:id"
            element={<EditAttorneyContractDocumentHoursPage />}
          ></Route>

          <Route
            path="/attorney/contract"
            element={<AttorneyContractListPage />}
          ></Route>
          <Route
            path="/attorney/add-contract"
            element={<AddAttorneyContractPage />}
          ></Route>
          <Route
            path="/attorney/edit-contract/:id"
            element={<EditAttorneyContractPage />}
          ></Route> */}

          <Route
            path="/attorney/pending_contracts"
            element={<AttorneyPendingContractsListPage />}
          ></Route>

          <Route
            path="/attorney/edit-contract/:id"
            element={<EditAttorneyContractPage />}
          ></Route>

          <Route
            path="/attorney/executed_contracts"
            element={<AttorneyExecutedContractsListPage />}
          ></Route>
          <Route
            path="/attorney/upload_document"
            element={<AttorneyUploadDocument />}
          ></Route>
          <Route
            path="/attorney/documents"
            element={<AttorneyDocumentsListPage />}
          ></Route>
          <Route
            path="/attorney/upload_document/:id"
            element={<AttorneyUploadDocumentListPage />}
          ></Route>
          <Route
            path="/attorney/contracts_document_update/:id/:doc"
            element={<AttorneyContractsDocumentUploadEditPage />}
          ></Route>
          <Route
            path="/attorney/edit_document/:id"
            element={<AttorneyEditDocumentListPage />}
          ></Route>
          <Route
            path="/attorney/view_document/:id"
            element={<AttorneyViewDocumentsListPage />}
          ></Route>
          <Route
            path="/attorney/view_executed_document/:id"
            element={<AttorneyViewExecutedDocumentsListPage />}
          ></Route>
          <Route
            path="/attorney/view_executed_document_update/:id/:doc"
            element={<AttorneyContractsDocumentUploadListPage />}
          ></Route>
          <Route
            path="/attorney/contract_details/:id"
            element={<AttorneyContractsDetailsListPage />}
          ></Route>
          <Route
            path="/attorney/details_counter_party_email/:id"
            element={<AttorneyCounterPatyEmail />}
          ></Route>
          <Route
            path="/attorney/contract_activity_log/:id"
            element={<AttorneyContractsActivityLogListPage />}
          ></Route>
          <Route
            path="/attorney/add_hours/"
            element={<AttorneyAddHoursLogListPage />}
          ></Route>
          <Route
            path="/attorney/client_hours/:id"
            element={<AttorneyClientHoursListPage />}
          ></Route>
          <Route
            path="/attorney/edit_client_hours/:id"
            element={<EditAttorneyClientHoursPage />}
          ></Route>
          <Route
            path="/attorney/client/"
            element={<AttorneyClientListPage />}
          ></Route>
          <Route
            path="/attorney/client_update_playbook/:id"
            element={<AttorneyClientUpdatePlaybookListPage />}
          ></Route>
          <Route
            path="/attorney/client_update_nda/:id"
            element={<AttorneyClientUpdateNdaListPage />}
          ></Route>

          <Route
            path="/attorney/projects/"
            element={<AttorneyProjectsListPage />}
          ></Route>

          <Route
            path="/attorney/view_playbook/:id"
            element={<AttorneyViewPlaybookListPage />}
          ></Route>
          <Route
            path="/attorney/view_playbook_update/:id/:doc"
            element={<AttorneyPlaybookUploadListPage />}
          ></Route>
          <Route
            path="/attorney/view_nda/:id"
            element={<AttorneyViewNDAListPage />}
          ></Route>
          <Route
            path="/attorney/view_nda_update/:id/:doc"
            element={<AttorneyNADUploadListPage />}
          ></Route>
          {/* <Route
            path="/attorney/profile/"
            element={<AttorneyProjectsListPage />}
          ></Route> */}
          {/*
          <Route
            path="/attorney/activity_log"
            element={<AttorneyActivityLogListPage />}
          ></Route>
          <Route
            path="/attorney/add-activity_log"
            element={<AddAttorneyActivityLogPage />}
          ></Route>
          <Route
            path="/attorney/edit-activity_log/:id"
            element={<EditAttorneyActivityLogPage />}
          ></Route>

          <Route
            path="/attorney/law_firm_client"
            element={<AttorneyLawFirmClientListPage />}
          ></Route>
          <Route
            path="/attorney/add-law_firm_client"
            element={<AddAttorneyLawFirmClientPage />}
          ></Route>
          <Route
            path="/attorney/edit-law_firm_client/:id"
            element={<EditAttorneyLawFirmClientPage />}
          ></Route>

          <Route
            path="/attorney/invoice_cronjob"
            element={<AttorneyInvoiceCronjobListPage />}
          ></Route>
          <Route
            path="/attorney/add-invoice_cronjob"
            element={<AddAttorneyInvoiceCronjobPage />}
          ></Route>
          <Route
            path="/attorney/edit-invoice_cronjob/:id"
            element={<EditAttorneyInvoiceCronjobPage />}
          ></Route>

          <Route
            path="/attorney/invoice"
            element={<AttorneyInvoiceListPage />}
          ></Route>
          <Route
            path="/attorney/add-invoice"
            element={<AddAttorneyInvoicePage />}
          ></Route>
          <Route
            path="/attorney/edit-invoice/:id"
            element={<EditAttorneyInvoicePage />}
          ></Route>

          <Route
            path="/attorney/project"
            element={<AttorneyProjectListPage />}
          ></Route>
          <Route
            path="/attorney/add-project"
            element={<AddAttorneyProjectPage />}
          ></Route>
          <Route
            path="/attorney/edit-project/:id"
            element={<EditAttorneyProjectPage />}
          ></Route>

          <Route
            path="/attorney/client_rate"
            element={<AttorneyClientRateListPage />}
          ></Route>
          <Route
            path="/attorney/add-client_rate"
            element={<AddAttorneyClientRatePage />}
          ></Route>
          <Route
            path="/attorney/edit-client_rate/:id"
            element={<EditAttorneyClientRatePage />}
          ></Route>

          <Route
            path="/attorney/doc_type"
            element={<AttorneyDocTypeListPage />}
          ></Route>
          <Route
            path="/attorney/add-doc_type"
            element={<AddAttorneyDocTypePage />}
          ></Route>
          <Route
            path="/attorney/edit-doc_type/:id"
            element={<EditAttorneyDocTypePage />}
          ></Route>

          <Route
            path="/attorney/contract_tag"
            element={<AttorneyContractTagListPage />}
          ></Route>
          <Route
            path="/attorney/add-contract_tag"
            element={<AddAttorneyContractTagPage />}
          ></Route>
          <Route
            path="/attorney/edit-contract_tag/:id"
            element={<EditAttorneyContractTagPage />}
          ></Route>

          <Route
            path="/attorney/email_template"
            element={<AttorneyEmailTemplateListPage />}
          ></Route>
          <Route
            path="/attorney/add-email_template"
            element={<AddAttorneyEmailTemplatePage />}
          ></Route>
          <Route
            path="/attorney/edit-email_template/:id"
            element={<EditAttorneyEmailTemplatePage />}
          ></Route>

          <Route path="/attorney/tag" element={<AttorneyTagListPage />}></Route>
          <Route
            path="/attorney/add-tag"
            element={<AddAttorneyTagPage />}
          ></Route>
          <Route
            path="/attorney/edit-tag/:id"
            element={<EditAttorneyTagPage />}
          ></Route> */}

          {/*<Route path="/user/billing" element={<UserBillingPage />} ></Route>*/}
          {/* <Route
            path="/user/checkout"
            element={<UserCheckoutCallback />}
          ></Route> */}
          {/*<Route exact path="/plans" element={<PublicStripePlansListing />}></Route>*/}
          <Route path="*" element={<Navigate to="/attorney" />}></Route>
        </Routes>
      );
      break;

    case "lawfirm":
      return (
        <Routes>
          <Route
            exact
            path="/lawfirm"
            element={<LawFirmDashboardPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/dashboard"
            element={<LawFirmDashboardPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/profile"
            element={<LawFirmProfilePage />}
          ></Route>

          <Route
            path="/lawfirm/pending_contracts"
            element={<LawFirmPendingContractsListPage />}
          ></Route>
          <Route
            path="/lawfirm/executed_contracts"
            element={<LawFirmExecutedContractsListPage />}
          ></Route>
          <Route
            path="/lawfirm/edit_document/:id"
            element={<LawfirmEditDocumentListPage />}
          ></Route>
          <Route
            path="/lawfirm/contract_activity_log/:id"
            element={<LawfirmContractsActivityLogListPage />}
          ></Route>
          <Route
            path="/lawfirm/contracts_document_update/:id/:doc"
            element={<LawfirmContractsDocumentUploadEditPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/subclient"
            element={<LawFirmSubClientListPage />}
          ></Route>

          <Route
            exact
            path="/lawfirm/edit-subclient/:id"
            element={<EditLawFirmSubClientPage />}
          ></Route>

          <Route
            path="/lawfirm/details_counter_party_email/:id"
            element={<LawfirmCounterPatyEmail />}
          ></Route>
          <Route
            path="/lawfirm/add_hours"
            element={<LawFirmAddHoursLogListPage />}
          ></Route>
          <Route
            path="/lawfirm/client_hours/:id"
            element={<LawFirmClientHoursListPage />}
          ></Route>
          {/* <Route
            path="/lawfirm/add-client_hours"
            element={<LawFirmAddClientHoursPage />}
          ></Route> */}
          <Route
            path="/lawfirm/edit_client_hours/:id"
            element={<EditLawFirmClientHoursPage />}
          ></Route>

          <Route
            path="/lawfirm/clients"
            element={<LawFirmClientListPage />}
          ></Route>
          <Route
            path="/lawfirm/client_update_playbook/:id"
            element={<LawfirmClientUpdatePlaybookListPage />}
          ></Route>
          {/* <Route
            path="/lawfirm/view_client_playbook/:id"
            element={<LawfirmViewClientPlaybookListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_client_playbook_update/:id/:doc"
            element={<LawfirmClientPlaybookUploadListPage />}
          ></Route> */}
          <Route
            path="/lawfirm/client_rate/:id"
            element={<LawFirmClientRateListPage />}
          ></Route>
          <Route
            path="/lawfirm/add_client_rate/:id"
            element={<AddLawFirmClientRatePage />}
          ></Route>
          <Route
            path="/lawfirm/edit_client_rate/:id"
            element={<EditLawFirmClientRatePage />}
          ></Route>

          <Route
            path="/lawfirm/add-projects"
            element={<AddLawFirmProjectPage />}
          ></Route>
          <Route
            path="/lawfirm/edit-project/:id"
            element={<EditLawFirmProjectPage />}
          ></Route>
          <Route
            path="/lawfirm/projects"
            element={<LawFirmProjectsListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_playbook/:id"
            element={<LawfirmViewPlaybookListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_playbook_update/:id/:doc"
            element={<AttorneyPlaybookUploadListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_nda/:id"
            element={<LawfirmViewNDAListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_nda_update/:id/:doc"
            element={<AttorneyNADUploadListPage />}
          ></Route>
          <Route
            path="/lawfirm/attorneys"
            element={<LawFirmAttorneysListPage />}
          ></Route>
          <Route path="/lawfirm/tag" element={<LawFirmTagListPage />}></Route>
          <Route
            path="/lawfirm/activity_log"
            element={<LawFirmActivityLogListPage />}
          ></Route>
          <Route
            path="/lawfirm/add-activity_log"
            element={<AddLawFirmActivityLogPage />}
          ></Route>
          <Route
            path="/lawfirm/edit-activity_log/:id"
            element={<EditLawFirmActivityLogPage />}
          ></Route>
          <Route
            path="/lawfirm/upload_document/:id"
            element={<LawFirmUploadDocumentListPage />}
          ></Route>
          <Route
            path="/lawfirm/upload_document"
            element={<LawFirmUploadDocument />}
          ></Route>
          <Route
            path="/lawfirm/documents"
            element={<LawfirmDocumentsListPage />}
          ></Route>
          <Route
            path="/lawfirm/assign_client/:id"
            element={<AddLawFirmAssignClientPage />}
          ></Route>
          <Route
            path="/lawfirm/view_attorney_clients/:id"
            element={<ViewLawFirmAttorneyAssignedClients />}
          ></Route>
          <Route
            path="/lawfirm/view_document/:id"
            element={<LawFirmViewDocumentsListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_executed_document/:id"
            element={<LawFirmViewExecutedDocumentsListPage />}
          ></Route>
          <Route
            path="/lawfirm/view_executed_document_update/:id/:doc"
            element={<AttorneyContractsDocumentUploadListPage />}
          ></Route>
          <Route
            path="/law_firm/law_firm_attorney"
            element={<LawFirmLawFirmAttorneyListPage />}
          ></Route>
          <Route
            path="/law_firm/add-law_firm_attorney"
            element={<AddLawFirmLawFirmAttorneyPage />}
          ></Route>
          <Route
            path="/law_firm/edit-law_firm_attorney/:id"
            element={<EditLawFirmLawFirmAttorneyPage />}
          ></Route>

          <Route
            path="/law_firm/contract_document_hours"
            element={<LawFirmContractDocumentHoursListPage />}
          ></Route>
          <Route
            path="/law_firm/add-contract_document_hours"
            element={<AddLawFirmContractDocumentHoursPage />}
          ></Route>
          <Route
            path="/law_firm/edit-contract_document_hours/:id"
            element={<EditLawFirmContractDocumentHoursPage />}
          ></Route>

          <Route
            path="/law_firm/contract"
            element={<LawFirmContractListPage />}
          ></Route>
          <Route
            path="/law_firm/add-contract"
            element={<AddLawFirmContractPage />}
          ></Route>
          <Route
            path="/lawfirm/edit-contract/:id"
            element={<EditLawFirmContractPage />}
          ></Route>

          <Route
            path="/law_firm/law_firm_client"
            element={<LawFirmLawFirmClientListPage />}
          ></Route>
          <Route
            path="/law_firm/add-law_firm_client"
            element={<AddLawFirmLawFirmClientPage />}
          ></Route>
          <Route
            path="/law_firm/edit-law_firm_client/:id"
            element={<EditLawFirmLawFirmClientPage />}
          ></Route>

          <Route
            path="/law_firm/invoice_cronjob"
            element={<LawFirmInvoiceCronjobListPage />}
          ></Route>
          <Route
            path="/law_firm/add-invoice_cronjob"
            element={<AddLawFirmInvoiceCronjobPage />}
          ></Route>
          <Route
            path="/law_firm/edit-invoice_cronjob/:id"
            element={<EditLawFirmInvoiceCronjobPage />}
          ></Route>

          <Route
            path="/lawfirm/invoice"
            element={<LawFirmInvoiceListPage />}
          ></Route>

          <Route
            path="/lawfirm/invoice/:id"
            element={<LawFirmInvoiceDetailsPage />}
          ></Route>

          <Route
            path="/lawfirm/add-invoice"
            element={<AddLawFirmInvoicePage />}
          ></Route>
          <Route
            path="/lawfirm/edit-invoice/:id"
            element={<EditLawFirmInvoicePage />}
          ></Route>

          <Route
            path="/law_firm/project"
            element={<LawFirmProjectListPage />}
          ></Route>
          <Route
            path="/law_firm/add-project"
            element={<AddLawFirmProjectPage />}
          ></Route>
          <Route
            path="/law_firm/edit-project/:id"
            element={<EditLawFirmProjectPage />}
          ></Route>
          <Route
            path="/law_firm/doc_type"
            element={<LawFirmDocTypeListPage />}
          ></Route>
          <Route
            path="/law_firm/add-doc_type"
            element={<AddLawFirmDocTypePage />}
          ></Route>
          <Route
            path="/law_firm/edit-doc_type/:id"
            element={<EditLawFirmDocTypePage />}
          ></Route>

          <Route
            path="/law_firm/contract_tag"
            element={<LawFirmContractTagListPage />}
          ></Route>
          <Route
            path="/law_firm/add-contract_tag"
            element={<AddLawFirmContractTagPage />}
          ></Route>
          <Route
            path="/law_firm/edit-contract_tag/:id"
            element={<EditLawFirmContractTagPage />}
          ></Route>

          <Route
            path="/law_firm/email_template"
            element={<LawFirmEmailTemplateListPage />}
          ></Route>
          <Route
            path="/law_firm/add-email_template"
            element={<AddLawFirmEmailTemplatePage />}
          ></Route>
          <Route
            path="/law_firm/edit-email_template/:id"
            element={<EditLawFirmEmailTemplatePage />}
          ></Route>

          <Route
            path="/law_firm/add-tag"
            element={<AddLawFirmTagPage />}
          ></Route>
          <Route
            path="/law_firm/edit-tag/:id"
            element={<EditLawFirmTagPage />}
          ></Route>

          {/*<Route path="/user/billing" element={<UserBillingPage />} ></Route>*/}
          <Route
            path="/user/checkout"
            element={<UserCheckoutCallback />}
          ></Route>
          {/*<Route exact path="/plans" element={<PublicStripePlansListing />}></Route>*/}
          <Route path="*" element={<Navigate to="/lawfirm" />}></Route>
        </Routes>
      );
      break;

    default:
      return (
        <Routes>
          <Route exact path="/admin/login" element={<AdminLoginPage />}></Route>
          <Route exact path="/" element={<ClientLoginPage />}></Route>
          <Route
            exact
            path="/two_fa/code"
            element={<AdminLoginPage2FA />}
          ></Route>

          <Route
            exact
            path="/two_fa"
            element={<AdminLoginPage2FAWithToken />}
          ></Route>

          <Route
            exact
            path="/admin/forgot"
            element={<AdminForgotPage />}
          ></Route>
          <Route exact path="/admin/reset" element={<AdminResetPage />}></Route>

          <Route
            exact
            path="/client/login"
            element={<ClientLoginPage />}
          ></Route>
          <Route
            exact
            path="/subclient/login"
            element={<SubclientLoginPage />}
          ></Route>
          <Route
            exact
            path="/subclient/forgot"
            element={<SubclientForgotPage />}
          ></Route>
          <Route
            exact
            path="/subclient/reset"
            element={<SubclientResetPage />}
          ></Route>
          <Route
            exact
            path="/client/signup"
            element={<ClientSignUpPage />}
          ></Route>
          <Route
            exact
            path="/subclient/signup"
            element={<SubClientSignUpPage />}
          ></Route>
          <Route
            exact
            path="/verification-modal"
            element={<ClientVerificationModal />}
          ></Route>
          <Route
            exact
            path="/client/verify-email"
            element={<ClientVerificationEmail />}
          ></Route>
          <Route
            exact
            path="/subclient/verify-email"
            element={<SubclientVerificationEmail />}
          ></Route>
          <Route
            exact
            path="/client/forgot"
            element={<ClientForgotPage />}
          ></Route>
          <Route
            exact
            path="/client/reset"
            element={<ClientResetPage />}
          ></Route>

          <Route
            exact
            path="/attorney/login"
            element={<AttorneyLoginPage />}
          ></Route>
          <Route
            exact
            path="/attorney/signup"
            element={<AttorneySignUpPage />}
          ></Route>
          <Route
            exact
            path="/attorney/verify-email"
            element={<AttorneyVerificationEmail />}
          ></Route>
          <Route
            exact
            path="/attorney/forgot"
            element={<AttorneyForgotPage />}
          ></Route>
          <Route
            exact
            path="/attorney/reset"
            element={<AttorneyResetPage />}
          ></Route>

          <Route
            exact
            path="/lawfirm/login"
            element={<LawFirmLoginPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/forgot"
            element={<LawFirmForgotPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/reset"
            element={<LawFirmResetPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/signup"
            element={<LawFirmSignUpPage />}
          ></Route>
          <Route
            exact
            path="/lawfirm/verify-email"
            element={<LawFirmVerificationEmail />}
          ></Route>
        </Routes>
      );
      break;
  }
}

function Main() {
  const { state } = React.useContext(AuthContext);
  const { state: sidebar } = React.useContext(GlobalContext);
  console.log(state);

  return (
    <div className="h-full">
      {/* <div className={`flex w-full ${state.isOpen ? "open-nav" : ""}`}> */}
      <div
        className={`grid w-full transition-all duration-200 ease-in-out ${
          sidebar.isOpen && state.isAuthenticated
            ? "grid-cols-[18%_82%]"
            : "grid-cols-[0%_100%]"
        }`}
      >
        {!state.isAuthenticated ? <PublicHeader /> : renderHeader(state.role)}
        <div className="w-full transition-all duration-200 ease-in-out">
          {state.isAuthenticated ? <TopHeader /> : null}
          <div className="page-wrapper w-full py-10 px-5">
            {!state.isAuthenticated
              ? renderRoutes("none")
              : renderRoutes(state.role)}
          </div>
        </div>
      </div>
      {/* <SnackBar /> */}
      <SnackBarV2 />
    </div>
  );
}

export default Main;
