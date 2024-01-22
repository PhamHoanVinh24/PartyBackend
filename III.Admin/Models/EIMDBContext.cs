using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using III.Domain.Common;

namespace ESEIM.Models
{
    public partial class EIMDBContext : IdentityDbContext<AspNetUser, AspNetRole, string>
    {
        public EIMDBContext(DbContextOptions<EIMDBContext> options) : base(options)
        {
        }
        public virtual DbSet<AdDivision> AdDivisions { get; set; }
        public virtual DbSet<AdAccessLog> AdAccessLogs { get; set; }
        public virtual DbSet<AdActionLog> AdActionLogs { get; set; }
        public virtual DbSet<AdAppFunction> AdAppFunctions { get; set; }
        public virtual DbSet<AdApplication> AdApplications { get; set; }
        public virtual DbSet<AdFunction> AdFunctions { get; set; }
        public virtual DbSet<AdGroupUser> AdGroupUsers { get; set; }
        public virtual DbSet<AdLanguage> AdLanguages { get; set; }
        public virtual DbSet<AdLanguageText> AdLanguageTexts { get; set; }
        public virtual DbSet<AdOrganization> AdOrganizations { get; set; }
        public virtual DbSet<AdParameter> AdParameters { get; set; }
        public virtual DbSet<AdPermission> AdPermissions { get; set; }
        public virtual DbSet<AdPrivilege> AdPrivileges { get; set; }
        public virtual DbSet<AdResource> AdResources { get; set; }
        public virtual DbSet<AdUserInGroup> AdUserInGroups { get; set; }

        //Customer
        public virtual DbSet<EDMSCustomer> EDMSCustomers { get; set; }
        public virtual DbSet<EDMSCustomerFile> EDMSCustomerFiles { get; set; }
        public virtual DbSet<EDMSCustomerExtend> EDMSCustomerExtends { get; set; }
        public virtual DbSet<EDMSOrderRequestRaw> EDMSOrderRequestRaws { get; set; }

        //Supplier
        public virtual DbSet<EDMSSupplier> EDMSSuppliers { get; set; }
        public virtual DbSet<EDMSSupplierExtend> EDMSSupplierExtends { get; set; }
        public virtual DbSet<EDMSSupplierFile> EDMSSupplierFiles { get; set; }

        public virtual DbSet<EDMSRepositoryFile> EDMSRepositoryFiles { get; set; }
        public virtual DbSet<EDMSRepository> EDMSRepositorys { get; set; }
        public virtual DbSet<EDMSFile> EDMSFiles { get; set; }
        public virtual DbSet<EDMSFilePermission> EDMSFilePermissions { get; set; }

        public virtual DbSet<EDMSServiceCategory> EDMSServiceCategorys { get; set; }

        public virtual DbSet<EDMSProductCat> EDMSProductCats { get; set; }


        public virtual DbSet<EDMSNotification> EDMSNotifications { get; set; }



        //contract
        public virtual DbSet<EDMSContractHeader> EDMSContractHeaders { get; set; }
        public virtual DbSet<EDMSContractDetail> EDMSContractDetails { get; set; }
        public virtual DbSet<EDMSContractFile> EDMSContractFiles { get; set; }
        public virtual DbSet<EDMSContractPeopleTag> EDMSContractPeopleTags { get; set; }
        public virtual DbSet<EDMSContractAttribute> EDMSContractAttributes { get; set; }
        public virtual DbSet<EDMSContractActivity> EDMSContractActivitys { get; set; }
        public virtual DbSet<EDMSContact> EDMSContacts { get; set; }
        public virtual DbSet<EDMSContactNote> EDMSContactNotes { get; set; }
        public virtual DbSet<EDMSContractMemberTag> EDMSContractMemberTags { get; set; }


        //Warehouse     
        public virtual DbSet<EDMSMaterialProduct> EDMSMaterialProducts { get; set; }
        public virtual DbSet<EDMSMaterialProductGroup> EDMSMaterialProductGroups { get; set; }
        public virtual DbSet<EDMSMaterialType> EDMSMaterialTypes { get; set; }
        public virtual DbSet<EDMSMaterialAttribute> EDMSMaterialAttributes { get; set; }
        public virtual DbSet<EDMSMaterialFile> EDMSMaterialFiles { get; set; }
        public virtual DbSet<EDMSMaterialStoreExpGoodsHeader> EDMSMaterialStoreExpGoodsHeaders { get; set; }
        public virtual DbSet<EDMSMaterialStoreBatchGoods> EDMSMaterialStoreBatchGoodss { get; set; }
        public virtual DbSet<EDMSMaterialStoreImpGoodsHeader> EDMSMaterialStoreImpGoodsHeaders { get; set; }
        public virtual DbSet<EDMSMaterialStoreImpGoodsDetail> EDMSMaterialStoreImpGoodsDetails { get; set; }
        public virtual DbSet<EDMSMaterialInvoice> EDMSMaterialInvoices { get; set; }
        public virtual DbSet<EDMSCommonSetting> EDMSCommonSettings { get; set; }
        public virtual DbSet<EDMSMaterialStore> EDMSMaterialStores { get; set; }
        public virtual DbSet<EDMSMaterialPaymentTicket> EDMSMaterialPaymentTickets { get; set; }


        //Asset
        public virtual DbSet<EDMSAsset> EDMSAssets { get; set; }
        public virtual DbSet<EDMSAssetAttribute> EDMSAssetAttributes { get; set; }
        public virtual DbSet<EDMSAssetActivity> EDMSAssetAtivitys { get; set; }



        //HR
        public virtual DbSet<EDMSHRAddress> EDMSHRAddress { get; set; }
        public virtual DbSet<EDMSHRContact> EDMSHRContacts { get; set; }
        public virtual DbSet<EDMSHRContract> EDMSHRContracts { get; set; }
        public virtual DbSet<EDMSHREmployee> EDMSHREmployees { get; set; }
        public virtual DbSet<EDMSHRTrainingCourse> EDMSHRTrainingCourses { get; set; }
        public virtual DbSet<EDMSHRWorkFlows> EDMSHRWorkFlows { get; set; }
        public virtual DbSet<EDMSHRWorkingProcess> EDMSHRWorkingProcesss { get; set; }


        //project
        public virtual DbSet<EDMSProject> EDMSProjects { get; set; }
        public virtual DbSet<EDMSProjectCustomer> EDMSProjectCustomers { get; set; }
        public virtual DbSet<EDMSProjectGantt> EDMSProjectGantts { get; set; }
        public virtual DbSet<EDMSProjectMember> EDMSProjectMembers { get; set; }
        public virtual DbSet<EDMSProjectFile> EDMSProjectFiles { get; set; }
        public virtual DbSet<EDMSProjectSupplier> EDMSProjectSuppliers { get; set; }
        public virtual DbSet<EDMSProjectNote> EDMSProjectNotes { get; set; }





        //WORK_OS
        public virtual DbSet<WORKOSBoard> WORKOSBoard { get; set; }
        public virtual DbSet<WORKOSList> WORKOSList { get; set; }
        public virtual DbSet<WORKOSCard> WORKOSCard { get; set; }
        public virtual DbSet<CardCheckList> CardCheckList { get; set; }
        public virtual DbSet<CardChkItem> CardChkItem { get; set; }
        public virtual DbSet<CardAttachment> CardAttachment { get; set; }
        public virtual DbSet<CardCommentList> CardCommentList { get; set; }
        public virtual DbSet<WorkExecutiveObjectrelative> WorkExecutiveObjectrelative { get; set; }
        public virtual DbSet<WorkOsTeam> WorkOsTeam { get; set; }
        public virtual DbSet<CardForWObj> CardForWObj { get; set; }
        public virtual DbSet<CardMember> CardMember { get; set; }

        public virtual DbSet<SOSInfo> SOSInfos { get; set; }
        public virtual DbSet<GisTable> GisTables { get; set; }
        public virtual DbSet<SOSMedia> SOSMedias { get; set; }

        //Candidate
        public virtual DbSet<CandidateBasic> CandiateBasic { get; set; }
        public virtual DbSet<CandidateWorkEvent> CandidateWorkEvents { get; set; }
        public virtual DbSet<CandidateInterview> CandidateInterviews { get; set; }

        //Staff
        public virtual DbSet<StaffScheduleWork> StaffScheduleWorks { get; set; }
        public virtual DbSet<StaffTimetableWorking> StaffTimetableWorkings { get; set; }

        //Keyword
        public virtual DbSet<EDMSGalaxyKeyword> EDMSGalaxyKeywords { get; set; }

        //Google api
        public virtual DbSet<EDMSApiGoogleServices> EDMSApiGoogleServices { get; set; }
        public virtual DbSet<EDMSCountRequestGoogle> EDMSCountRequestGoogle { get; set; }





        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region Builder entity
            //modelBuilder.Entity<VIBActionLog>(entity =>
            //{
            //    entity.HasIndex(e => e.CreatedDate).HasName("IX_VIB_ActionLog_CreatedDate");
            //});

            //modelBuilder.Entity<VIBActionLogHist>(entity =>
            //{
            //    entity.HasIndex(e => e.CreatedDate).HasName("IX_VIB_ActionLogHist_Created");
            //});

            modelBuilder.Entity<AspNetRole>(entity =>
            {
                //entity.ToTable("AspNetRoles");

                entity.Property(e => e.Id).HasMaxLength(50).HasColumnName("RoleId");
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(255);
                entity.Property(e => e.Name).HasMaxLength(255);
                entity.Property(e => e.NormalizedName).HasMaxLength(255);

                entity.HasIndex(e => e.NormalizedName).HasName("IX_ROLES_NAME").IsUnique();
            });

            modelBuilder.Entity<AspNetUser>(entity =>
            {
                //entity.ToTable("AspNetUsers");

                entity.Property(e => e.Id).HasMaxLength(50).HasColumnName("UserId");
                entity.Property(e => e.ConcurrencyStamp).HasMaxLength(50);
                entity.Property(e => e.PasswordHash).HasMaxLength(2000);
                entity.Property(e => e.SecurityStamp).HasMaxLength(50);
                entity.Property(e => e.PhoneNumber).HasMaxLength(100);

                entity.Property(e => e.Email).HasMaxLength(256);
                entity.Property(e => e.NormalizedEmail).HasMaxLength(256);

                entity.Property(e => e.UserName).IsRequired().HasMaxLength(256);
                entity.Property(e => e.NormalizedUserName).IsRequired().HasMaxLength(256);

                entity.HasIndex(e => e.NormalizedEmail).HasName("IX_USERS_EMAIL");
                entity.HasIndex(e => e.NormalizedUserName).HasName("IX_USERS_USER_NAME").IsUnique();

                //entity.Property(e => e.UserName).HasMaxLength(256);
                //entity.HasOne(d => d.Org)
                //.WithMany(p => p.AspNetUsers)
                //.HasForeignKey(d => d.OrgId)
                //.HasConstraintName("FK_AspNetUsers_ESOrganizations");
            });

            modelBuilder.Entity<AdApplication>(entity =>
            {
                //entity.HasIndex(e => e.ApplicationCode).IsUnique();

                //entity.HasMany(p => p.AppFunctions)
                //    .WithOne(b => b.Application)
                //    .HasForeignKey(p => p.CodeApplication)
                //    .HasPrincipalKey(b => b.CodeApplication);

                //entity.HasMany(p => p.Permissions)
                //    .WithOne(b => b.Application)
                //    .HasForeignKey(p => p.CodeApplication)
                //    .HasPrincipalKey(b => b.CodeApplication);
            });

            modelBuilder.Entity<AdFunction>(entity =>
            {
                //entity.HasIndex(e => e.FunctionCode).IsUnique();

                //entity.HasOne(p => p.Parent)
                //    .WithMany(b => b.InverseParent)
                //    .HasForeignKey(p => p.ParentCode);

                //entity.HasMany(p => p.AppFunctions)
                //    .WithOne(b => b.Function)
                //    .HasForeignKey(p => p.CodeFunction)
                //    .HasPrincipalKey(b => b.Code);

                //entity.HasMany(p => p.Privileges)
                //    .WithOne(b => b.Function)
                //    .HasForeignKey(p => p.CodeFunction)
                //    .HasPrincipalKey(b => b.Code);

                //entity.HasMany(p => p.Permissions)
                //    .WithOne(b => b.Function)
                //    .HasForeignKey(p => p.CodeFunction)
                //    .HasPrincipalKey(b => b.Code);
            });

            modelBuilder.Entity<AdAppFunction>(entity =>
            {
                //entity.HasKey(e => new { e.ApplicationCode, e.FunctionCode });

                //entity.HasOne(p => p.Application)
                //    .WithMany(b => b.AppFunctions)
                //    .HasForeignKey(p => p.CodeApplication);

                //entity.HasOne(p => p.Function)
                //    .WithMany(b => b.AppFunctions)
                //    .HasForeignKey(p => p.CodeFunction);
            });

            modelBuilder.Entity<AdGroupUser>(entity =>
            {
                //entity.HasIndex(e => e.GroupUserCode).IsUnique();

                //entity.HasOne(p => p.Parent)
                //    .WithMany(b => b.InverseParent)
                //    .HasForeignKey(p => p.ParentCode);

                //entity.HasMany(p => p.VIBUserInGroups)
                //    .WithOne(b => b.GroupUser)
                //    .HasForeignKey(p => p.Code_GroupUser)
                //    .HasPrincipalKey(b => b.Code_GroupUser);

                //entity.HasMany(p => p.VIBPermissions)
                //    .WithOne(b => b.GroupUser)
                //    .HasForeignKey(p => p.Code_GroupUser)
                //    .HasPrincipalKey(b => b.Code_GroupUser);
            });

            modelBuilder.Entity<AdOrganization>(entity =>
            {

            });

            modelBuilder.Entity<AdParameter>(entity =>
            {
                //entity.ToTable("VIBParameter");

                //entity.HasIndex(e => e.ParameterCode).IsUnique();

                //entity.HasOne(d => d.Group)
                //    .WithMany(p => p.VIBParameters)
                //    .HasForeignKey(d => d.GroupId)
                //    .HasConstraintName("FK_ESParameters_ESGroupParameters");

                //entity.HasOne(p => p.Parent)
                //    .WithMany(b => b.InverseParent)
                //    .HasForeignKey(p => p.ParentCode);
            });

            modelBuilder.Entity<AdPermission>(entity =>
            {
                //entity.HasOne(p => p.Application)
                //    .WithMany(b => b.Permissions)
                //    .HasForeignKey(p => p.CodeApplication);

                //entity.HasOne(p => p.Function)
                //    .WithMany(b => b.Permissions)
                //    .HasForeignKey(p => p.CodeFunction);

                //entity.HasOne(p => p.Resource)
                //    .WithMany(b => b.Permissions)
                //    .HasForeignKey(p => p.CodeResource);

                //entity.HasOne(p => p.User)
                //    .WithMany(b => b.VIBPermissions)
                //    .HasForeignKey(p => p.UserId);

                //entity.HasOne(p => p.Role)
                //    .WithMany(b => b.VIBPermissions)
                //    .HasForeignKey(p => p.RoleId);
            });

            modelBuilder.Entity<AdPrivilege>(entity =>
            {
                //entity.HasKey(e => new { e.FunctionCode, e.ResourceCode });

                //entity.HasOne(p => p.Function)
                //    .WithMany(b => b.Privileges)
                //    .HasForeignKey(p => p.CodeFunction);

                //entity.HasOne(p => p.Resource)
                //    .WithMany(b => b.Privileges)
                //    .HasForeignKey(p => p.CodeResource);
            });

            modelBuilder.Entity<AdResource>(entity =>
            {
                //entity.HasIndex(e => e.ResourceCode).IsUnique();

                //entity.HasOne(p => p.Parent)
                //    .WithMany(b => b.InverseParent)
                //    .HasForeignKey(p => p.ParentCode);

                //entity.HasMany(p => p.Privileges)
                //    .WithOne(b => b.Resource)
                //    .HasForeignKey(p => p.CodeResource)
                //    .HasPrincipalKey(b => b.Code);

                //entity.HasMany(p => p.Permissions)
                //    .WithOne(b => b.Resource)
                //    .HasForeignKey(p => p.CodeResource)
                //    .HasPrincipalKey(b => b.Code);
            });

            modelBuilder.Entity<AdUserInGroup>(entity =>
            {
                //entity.HasOne(p => p.GroupUser)
                //    .WithMany(b => b.VIBUserInGroups)
                //    .HasForeignKey(p => p.Code_GroupUser);

                //entity.HasOne(p => p.User)
                //    .WithMany(b => b.VIBUserInGroups)
                //    .HasForeignKey(p => p.UserId);

                //entity.HasOne(p => p.Role)
                //    .WithMany(b => b.VIBUserInGroups)
                //    .HasForeignKey(p => p.RoleId);
            });
            #endregion

            #region Backup builder
            //modelBuilder.Entity<VIBGroupUserPrivilege>().HasKey(c => new { c.GroupUserId, c.PrivilegeId });
            //modelBuilder.Entity<VIBUserInGroup>().HasKey(c => new { c.UserId, c.GroupUserId });
            //modelBuilder.Entity<VIBAppGroupResource>().HasKey(c => new { c.ApplicationId, c.GroupResourceId });
            //modelBuilder.Entity<VIBAppFunction>().HasKey(c => new { c.ApplicationId, c.FunctionId });

            //modelBuilder.Entity<ApiClaim>(entity =>
            //{
            //    entity.ToTable("ApiClaims");

            //    entity.HasIndex(e => e.ApiResourceId)
            //        .HasName("IX_ApiClaims_ApiResourceId");

            //    entity.Property(e => e.Type)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.ApiResource)
            //        .WithMany(p => p.ApiClaims)
            //        .HasForeignKey(d => d.ApiResourceId);
            //});

            //modelBuilder.Entity<ApiResource>(entity =>
            //{
            //    entity.ToTable("ApiResources");
            //    entity.HasIndex(e => e.Name)
            //        .HasName("IX_ApiResources_Name")
            //        .IsUnique();

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.DisplayName).HasMaxLength(200);

            //    entity.Property(e => e.Name)
            //        .IsRequired()
            //        .HasMaxLength(200);
            //});

            //modelBuilder.Entity<ApiScopeClaim>(entity =>
            //{
            //    entity.ToTable("ApiScopeClaims");
            //    entity.HasIndex(e => e.ApiScopeId)
            //        .HasName("IX_ApiScopeClaims_ApiScopeId");

            //    entity.Property(e => e.Type)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.ApiScope)
            //        .WithMany(p => p.ApiScopeClaims)
            //        .HasForeignKey(d => d.ApiScopeId);
            //});

            //modelBuilder.Entity<ApiScope>(entity =>
            //{
            //    entity.ToTable("ApiScopes");
            //    entity.HasIndex(e => e.ApiResourceId)
            //        .HasName("IX_ApiScopes_ApiResourceId");

            //    entity.HasIndex(e => e.Name)
            //        .HasName("IX_ApiScopes_Name")
            //        .IsUnique();

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.DisplayName).HasMaxLength(200);

            //    entity.Property(e => e.Name)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.ApiResources)
            //        .WithMany(p => p.ApiScopes)
            //        .HasForeignKey(d => d.ApiResourceId);
            //});

            //modelBuilder.Entity<ApiSecret>(entity =>
            //{
            //    entity.ToTable("ApiSecrets");
            //    entity.HasIndex(e => e.ApiResourceId)
            //        .HasName("IX_ApiSecrets_ApiResourceId");

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.Type).HasMaxLength(250);

            //    entity.Property(e => e.Value).HasMaxLength(2000);

            //    entity.HasOne(d => d.ApiResources)
            //        .WithMany(p => p.ApiSecrets)
            //        .HasForeignKey(d => d.ApiResourceId);
            //});
            //modelBuilder.Entity<IdentityResource>(entity =>
            //{
            //    entity.ToTable("IdentityResources");
            //    entity.HasIndex(e => e.Name)
            //        .HasName("IX_IdentityResources_Name")
            //        .IsUnique();

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.DisplayName).HasMaxLength(200);

            //    entity.Property(e => e.Name)
            //        .IsRequired()
            //        .HasMaxLength(200);
            //});
            //modelBuilder.Entity<IdentityClaim>(entity =>
            //{
            //    entity.ToTable("IdentityClaims");
            //    entity.HasIndex(e => e.IdentityResourceId)
            //        .HasName("IX_IdentityClaims_IdentityResourceId");

            //    entity.Property(e => e.Type)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.IdentityResources)
            //        .WithMany(p => p.IdentityClaims)
            //        .HasForeignKey(d => d.IdentityResourceId);
            //});
            //modelBuilder.Entity<ClientClaim>(entity =>
            //{
            //    entity.ToTable("ClientClaims");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientClaims_ClientId");

            //    entity.Property(e => e.Type)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    entity.Property(e => e.Value)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientClaims)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientCorsOrigin>(entity =>
            //{
            //    entity.ToTable("ClientCorsOrigins");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientCorsOrigins_ClientId");

            //    entity.Property(e => e.Origin)
            //        .IsRequired()
            //        .HasMaxLength(150);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientCorsOrigins)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientGrantType>(entity =>
            //{
            //    entity.ToTable("ClientGrantTypes");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientGrantTypes_ClientId");

            //    entity.Property(e => e.GrantType)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientGrantTypes)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientIdPrestriction>(entity =>
            //{
            //    entity.ToTable("ClientIdPrestrictions");
            //    entity.ToTable("ClientIdPRestrictions");

            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientIdPRestrictions_ClientId");

            //    entity.Property(e => e.Provider)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientIdPrestrictions)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientPostLogoutRedirectUri>(entity =>
            //{
            //    entity.ToTable("ClientPostLogoutRedirectUris");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientPostLogoutRedirectUris_ClientId");

            //    entity.Property(e => e.PostLogoutRedirectUri)
            //        .IsRequired()
            //        .HasMaxLength(2000);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientPostLogoutRedirectUris)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientRedirectUri>(entity =>
            //{
            //    entity.ToTable("ClientRedirectUris");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientRedirectUris_ClientId");

            //    entity.Property(e => e.RedirectUri)
            //        .IsRequired()
            //        .HasMaxLength(2000);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientRedirectUris)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientScope>(entity =>
            //{
            //    entity.ToTable("ClientScopes");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientScopes_ClientId");

            //    entity.Property(e => e.Scope)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientScopes)
            //        .HasForeignKey(d => d.ClientId);
            //});

            //modelBuilder.Entity<ClientSecret>(entity =>
            //{
            //    entity.ToTable("ClientSecrets");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ClientSecrets_ClientId");

            //    entity.Property(e => e.Description).HasMaxLength(2000);

            //    entity.Property(e => e.Type).HasMaxLength(250);

            //    entity.Property(e => e.Value)
            //        .IsRequired()
            //        .HasMaxLength(2000);

            //    entity.HasOne(d => d.Clients)
            //        .WithMany(p => p.ClientSecrets)
            //        .HasForeignKey(d => d.ClientId);
            //});
            //modelBuilder.Entity<Client>(entity =>
            //{
            //    entity.ToTable("Clients");
            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_Clients_ClientId")
            //        .IsUnique();

            //    entity.Property(e => e.ClientId)
            //        .IsRequired()
            //        .HasMaxLength(200);

            //    entity.Property(e => e.ClientName).HasMaxLength(200);

            //    entity.Property(e => e.ClientUri).HasMaxLength(2000);

            //    entity.Property(e => e.AlwaysIncludeUserClaimsInIdToken).HasColumnName("AlwaysIncludeUCInIdToken");
            //    entity.Property(e => e.UpdateAccessTokenClaimsOnRefresh).HasColumnName("UpdateAccessTCOnRefresh");

            //    entity.Property(e => e.ProtocolType)
            //        .IsRequired()
            //        .HasMaxLength(200);
            //});
            //modelBuilder.Entity<ESGroupApp>(entity =>
            //{
            //    entity.HasKey(e => new { e.GroupId, e.ApplicationId })
            //        .HasName("PK_ESGroupApps");

            //    entity.ToTable("ESGroupApps");

            //    entity.HasOne(d => d.Applications)
            //        .WithMany(p => p.ESGroupApps)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESGroupApps_ESApplications");

            //    entity.HasOne(d => d.Groups)
            //        .WithMany(p => p.ESGroupApps)
            //        .HasForeignKey(d => d.GroupId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESGroupApps_ESGroupUsers");
            //});
            //modelBuilder.Entity<ESGroupUser>(entity =>
            //{
            //    entity.ToTable("ESGroupUsers");

            //    entity.Property(e => e.Title).HasMaxLength(255);
            //});
            //modelBuilder.Entity<ESGroupUserPrivilege>(entity =>
            //{
            //    entity.HasKey(e => new { e.GroupUserId, e.PrivilegeId })
            //        .HasName("PK_ESGroupUserPrivileges");

            //    entity.ToTable("ESGroupUserPrivileges");

            //    entity.HasOne(d => d.GroupUsers)
            //        .WithMany(p => p.ESGroupUserPrivileges)
            //        .HasForeignKey(d => d.GroupUserId)
            //        .HasConstraintName("FK_ESGroupUserPrivileges_ESGroupUsers");

            //    entity.HasOne(d => d.Privileges)
            //        .WithMany(p => p.ESGroupUserPrivileges)
            //        .HasForeignKey(d => d.PrivilegeId)
            //        .HasConstraintName("FK_ESGroupUserPrivileges_ESPrivileges");
            //});

            //modelBuilder.Entity<AspNetRoleClaim>(entity =>
            //{
            //    entity.HasIndex(e => e.RoleId)
            //        .HasName("IX_AspNetRoleClaims_RoleId");

            //    entity.Property(e => e.RoleId)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    //entity.HasOne(d => d.Role)
            //    //    .WithMany(p => p.AspNetRoleClaims)
            //    //    .HasForeignKey(d => d.RoleId);
            //});

            //modelBuilder.Entity<AspNetUserRole>(entity =>
            //{
            //    entity.ToTable(name: "AspNetUserRoles", schema: "dbo");
            //    entity.HasKey(e => new { e.UserId, e.RoleId })
            //        .HasName("PK_AspNetUserRoles");

            //    entity.HasIndex(e => e.RoleId)
            //        .HasName("IX_AspNetUserRoles_RoleId");

            //    entity.Property(e => e.UserId).HasMaxLength(50);

            //    entity.Property(e => e.RoleId).HasMaxLength(250);

            //    entity.HasOne(d => d.Role)
            //        .WithMany(p => p.AspNetUserRoles)
            //        .HasForeignKey(d => d.RoleId);

            //    entity.HasOne(d => d.User)
            //        .WithMany(p => p.AspNetUserRoles)
            //        .HasForeignKey(d => d.UserId);
            //});

            //modelBuilder.Entity<ESUserInGroup>(entity =>
            //{
            //    entity.HasKey(e => new { e.GroupUserId, e.UserId })
            //        .HasName("PK_ESUserInGroups");

            //    entity.ToTable("ESUserInGroups");

            //    entity.Property(e => e.UserId).HasMaxLength(50);

            //    entity.HasOne(d => d.GroupUser)
            //        .WithMany(p => p.ESUserInGroups)
            //        .HasForeignKey(d => d.GroupUserId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESUserInGroups_ESGroupUsers");

            //    entity.HasOne(d => d.User)
            //        .WithMany(p => p.ESUserInGroups)
            //        .HasForeignKey(d => d.UserId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESUserInGroups_AspNetUsers");
            //});

            //modelBuilder.Entity<AspNetUserClaim>(entity =>
            //{
            //    entity.ToTable(name: "AspNetUserClaim", schema: "Security");
            //    entity.HasIndex(e => e.UserId)
            //        .HasName("IX_AspNetUserClaims_UserId");
            //    entity.HasKey(rc => rc.Id);
            //    entity.Property(e => e.UserId)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    //entity.HasOne(d => d.User)
            //    //    .WithMany(p => p.AspNetUserClaims)
            //    //    .HasForeignKey(d => d.UserId);
            //});

            //modelBuilder.Entity<AspNetUserLogin>(entity =>
            //{
            //    entity.HasKey(e => new { e.LoginProvider, e.ProviderKey })
            //        .HasName("PK_AspNetUserLogins");

            //    entity.HasIndex(e => e.UserId)
            //        .HasName("IX_AspNetUserLogins_UserId");

            //    entity.Property(e => e.LoginProvider).HasMaxLength(450);

            //    entity.Property(e => e.ProviderKey).HasMaxLength(450);

            //    entity.Property(e => e.UserId)
            //        .IsRequired()
            //        .HasMaxLength(250);

            //    //entity.HasOne(d => d.User)
            //    //    .WithMany(p => p.AspNetUserLogins)
            //    //    .HasForeignKey(d => d.UserId);
            //});

            //modelBuilder.Entity<AspNetUserToken>(entity =>
            //{
            //    entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name })
            //        .HasName("PK_AspNetUserTokens");

            //    entity.Property(e => e.UserId).HasMaxLength(450);

            //    entity.Property(e => e.LoginProvider).HasMaxLength(450);

            //    entity.Property(e => e.Name).HasMaxLength(450);
            //});



            //modelBuilder.Entity<ESAccessLog>(entity =>
            //{
            //    entity.ToTable("ESAccessLogs");

            //    //entity.Property(e => e.AccessDate).HasColumnType("datetime");

            //    entity.Property(e => e.Action)
            //        .IsRequired()
            //        .HasColumnType("varchar(50)");

            //    entity.Property(e => e.Application)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Description).HasMaxLength(450);

            //    entity.Property(e => e.Ipaddress)
            //        .HasColumnName("IPAddress")
            //        .HasColumnType("varchar(50)");

            //    entity.Property(e => e.Resource)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.UserId)
            //        .IsRequired()
            //        .HasMaxLength(250);
            //});

            //modelBuilder.Entity<ESAction>(entity =>
            //{
            //    entity.ToTable("ESActions");

            //    entity.Property(e => e.Id).HasMaxLength(50);

            //    entity.HasIndex(e => e.Id).IsUnique();

            //    entity.Property(e => e.Description).HasMaxLength(255);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});
            //modelBuilder.Entity<ESApiClient>(entity =>
            //{
            //    entity.ToTable("ESApiClients");

            //    entity.Property(e => e.Id).HasColumnType("int");
            //    entity.Property(e => e.Name).HasMaxLength(255);
            //    entity.Property(e => e.Scopes).HasMaxLength(255);
            //    entity.Property(e => e.Description).HasMaxLength(255);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESAppGResource>(entity =>
            //{
            //    entity.HasKey(e => new { e.ApplicationId, e.GroupResourceId })
            //        .HasName("PK_ESAppResources");

            //    entity.ToTable("ESAppGResources");

            //    entity.HasOne(d => d.Application)
            //        .WithMany(p => p.ESAppResources)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .HasConstraintName("FK_ESAppResources_ESApplications");

            //    entity.HasOne(d => d.GroupResource)
            //        .WithMany(p => p.ESAppResources)
            //        .HasForeignKey(d => d.GroupResourceId)
            //        .HasConstraintName("FK_ESAppGResources_ESResources");
            //});

            //modelBuilder.Entity<ESApplication>(entity =>
            //{
            //    entity.ToTable("ESApplications");

            //    entity.HasIndex(e => e.Code)
            //        .HasName("IX_ESApplications")
            //        .IsUnique();

            //    entity.Property(e => e.AuthenticationScheme).HasMaxLength(255);

            //    entity.Property(e => e.Authority).HasMaxLength(255);

            //    entity.Property(e => e.ClientId).HasMaxLength(255);

            //    entity.Property(e => e.ClientSecret).HasMaxLength(255);

            //    entity.Property(e => e.Code)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.NameClaimType).HasMaxLength(255);

            //    entity.Property(e => e.ResponseType).HasMaxLength(255);

            //    entity.Property(e => e.RoleClaimType).HasMaxLength(255);

            //    entity.Property(e => e.Scope).HasMaxLength(255);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESClientConnect>(entity =>
            //{
            //    entity.ToTable("ESClientConnects");

            //    //entity.Property(e => e.ConnectDate).HasColumnType("datetime");

            //    //entity.Property(e => e.DisconnectDate).HasColumnType("datetime");

            //    entity.Property(e => e.Ipaddress)
            //        .HasColumnName("IPAddress")
            //        .HasColumnType("varchar(50)");
            //});

            //modelBuilder.Entity<ESEndpointApp>(entity =>
            //{
            //    entity.HasKey(e => new { e.EndpointId, e.ApplicationId })
            //        .HasName("PK_ESEndpointApps");

            //    entity.ToTable("ESEndpointApps");

            //    entity.HasOne(d => d.Application)
            //        .WithMany(p => p.ESEndpointApps)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .HasConstraintName("FK_ESEndpointApps_ESApplications");

            //    entity.HasOne(d => d.Endpoint)
            //        .WithMany(p => p.ESEndpointApps)
            //        .HasForeignKey(d => d.EndpointId)
            //        .HasConstraintName("FK_ESEndpointApps_ESEndpoints");
            //});

            //modelBuilder.Entity<ESEndpoint>(entity =>
            //{
            //    entity.ToTable("ESEndpoints");

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.Ipaddress)
            //        .IsRequired()
            //        .HasColumnName("IPAddress")
            //        .HasColumnType("varchar(50)");

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESExtendAccount>(entity =>
            //{
            //    entity.ToTable("ESExtendAccounts");

            //    entity.Property(e => e.Account)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Type)
            //        .IsRequired()
            //        .HasColumnType("varchar(50)");

            //    entity.Property(e => e.UserId).HasMaxLength(250);

            //    entity.HasOne(d => d.User)
            //        .WithMany(p => p.ESExtendAccounts)
            //        .HasForeignKey(d => d.UserId)
            //        .OnDelete(DeleteBehavior.Cascade)
            //        .HasConstraintName("FK_ESExtendAccounts_AspNetUsers");
            //});

            //modelBuilder.Entity<ESGroupParameter>(entity =>
            //{
            //    entity.ToTable("ESGroupParameters");

            //    entity.Property(e => e.Description).HasMaxLength(500);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(250);
            //});

            //modelBuilder.Entity<ESOauthClient>(entity =>
            //{
            //    entity.ToTable("ESOAuthClients");

            //    entity.HasIndex(e => e.ClientId)
            //        .HasName("IX_ESOAuthClients")
            //        .IsUnique();

            //    entity.Property(e => e.AllowedScopes).HasMaxLength(255);

            //    entity.Property(e => e.ClientId)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.ClientSecret)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Description).HasMaxLength(255);

            //    entity.Property(e => e.GrantTypes)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Logo).HasMaxLength(255);

            //    entity.Property(e => e.PostLogoutRedirectUris).HasMaxLength(255);

            //    entity.Property(e => e.RedirectUris).HasMaxLength(255);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESOrgApp>(entity =>
            //{
            //    entity.HasKey(e => new { e.OrgId, e.ApplicationId })
            //        .HasName("PK_ESOrgApps");

            //    entity.ToTable("ESOrgApps");

            //    entity.HasOne(d => d.Application)
            //        .WithMany(p => p.ESOrgApps)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .HasConstraintName("FK_ESOrgApps_ESApplications");

            //    entity.HasOne(d => d.Org)
            //        .WithMany(p => p.ESOrgApps)
            //        .HasForeignKey(d => d.OrgId)
            //        .HasConstraintName("FK_ESOrgApps_ESOrganizations");
            //});

            //modelBuilder.Entity<ESOrgPrivilege>(entity =>
            //{
            //    entity.HasKey(e => new { e.OrgId, e.PrivilegeId })
            //        .HasName("PK_ESOrgPrivileges");

            //    entity.ToTable("ESOrgPrivileges");

            //    entity.HasOne(d => d.Org)
            //        .WithMany(p => p.ESOrgPrivileges)
            //        .HasForeignKey(d => d.OrgId)
            //        .HasConstraintName("FK_ESOrgPrivileges_ESOrganizations");

            //    entity.HasOne(d => d.Privilege)
            //        .WithMany(p => p.ESOrgPrivileges)
            //        .HasForeignKey(d => d.PrivilegeId)
            //        .HasConstraintName("FK_ESOrgPrivileges_ESPrivileges");
            //});

            //modelBuilder.Entity<ESOrganization>(entity =>
            //{
            //    entity.ToTable("ESOrganizations");

            //    entity.Property(e => e.Code)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Description).HasMaxLength(1000);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.HasOne(d => d.Parent)
            //        .WithMany(p => p.InverseParent)
            //        .HasForeignKey(d => d.ParentId)
            //        .HasConstraintName("FK_ESOrganizations_ESOrganizations");
            //});

            //modelBuilder.Entity<ESPolicy>(entity =>
            //{
            //    entity.ToTable("ESPolicies");

            //    entity.Property(e => e.Id).HasColumnType("varchar(50)");

            //    entity.Property(e => e.Description).HasMaxLength(500);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Value)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESPrivilege>(entity =>
            //{
            //    entity.ToTable("ESPrivileges");

            //    //entity.Property(e => e.Id).ValueGeneratedNever();

            //    entity.Property(e => e.ActionId)
            //        .IsRequired().HasMaxLength(50);

            //    entity.HasOne(d => d.Action)
            //        .WithMany(p => p.ESPrivileges)
            //        .HasForeignKey(d => d.ActionId)
            //        .HasConstraintName("FK_ESPrivileges_ESActions");

            //    entity.HasOne(d => d.Resource)
            //        .WithMany(p => p.ESPrivileges)
            //        .HasForeignKey(d => d.ResourceId)
            //        .HasConstraintName("FK_ESPrivileges_ESResources");
            //});

            //modelBuilder.Entity<ESResAttribute>(entity =>
            //{
            //    entity.ToTable("ESResAttributes");

            //    entity.Property(e => e.Key)
            //        .IsRequired()
            //        .HasMaxLength(50);

            //    entity.Property(e => e.Value)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.HasOne(d => d.Resource)
            //        .WithMany(p => p.ESResAttributes)
            //        .HasForeignKey(d => d.ResourceId)
            //        .HasConstraintName("FK_ESResAttributes_ESResources");
            //});

            //modelBuilder.Entity<ESGroupResource>(entity =>
            //{
            //    entity.ToTable("ESGroupResources");

            //    entity.Property(e => e.Id).HasMaxLength(50);
            //    entity.HasIndex(e => e.Id).IsUnique();

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);
            //});

            //modelBuilder.Entity<ESResource>(entity =>
            //{
            //    entity.ToTable("ESResources");
            //    entity.Property(e => e.Code)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.Title)
            //        .IsRequired()
            //        .HasMaxLength(255);

            //    entity.Property(e => e.GroupResourceId)
            //        .IsRequired()
            //        .HasMaxLength(50);

            //    entity.HasOne(d => d.Parent)
            //        .WithMany(p => p.InverseParent)
            //        .HasForeignKey(d => d.ParentId)
            //        .HasConstraintName("FK_ESResources_ESResources");

            //    entity.HasOne(d => d.TypeNavigation)
            //        .WithMany(p => p.ESResources)
            //        .HasForeignKey(d => d.GroupResourceId)
            //        .OnDelete(DeleteBehavior.Restrict)
            //        .HasConstraintName("FK_ESResources_ESResTypes");
            //});

            //modelBuilder.Entity<ESRoleApp>(entity =>
            //{
            //    entity.HasKey(e => new { e.RoleId, e.ApplicationId })
            //        .HasName("PK_ESRoleAPps");

            //    entity.ToTable("ESRoleApps");

            //    entity.Property(e => e.RoleId).HasMaxLength(250);

            //    entity.HasOne(d => d.Application)
            //        .WithMany(p => p.ESRoleApps)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .HasConstraintName("FK_ESRoleAPps_ESApplications");

            //    entity.HasOne(d => d.Role)
            //        .WithMany(p => p.ESRoleApps)
            //        .HasForeignKey(d => d.RoleId)
            //        .HasConstraintName("FK_ESRoleAPps_AspNetRoles");
            //});

            //modelBuilder.Entity<ESRolePrivilege>(entity =>
            //{
            //    entity.HasKey(e => new { e.RoleId, e.PrivilegeId })
            //        .HasName("PK_ESRolePrivileges");

            //    entity.ToTable("ESRolePrivileges");

            //    entity.Property(e => e.RoleId).HasMaxLength(250);

            //    entity.HasOne(d => d.Privilege)
            //        .WithMany(p => p.ESRolePrivileges)
            //        .HasForeignKey(d => d.PrivilegeId)
            //        .HasConstraintName("FK_ESRolePrivileges_ESPrivileges");

            //    entity.HasOne(d => d.Role)
            //        .WithMany(p => p.ESRolePrivileges)
            //        .HasForeignKey(d => d.RoleId)
            //        .HasConstraintName("FK_ESRolePrivileges_AspNetRoles");
            //});

            //modelBuilder.Entity<ESUserApp>(entity =>
            //{
            //    entity.HasKey(e => new { e.UserId, e.ApplicationId })
            //        .HasName("PK_ESUserApps");

            //    entity.ToTable("ESUserApps");

            //    entity.Property(e => e.UserId).HasMaxLength(250);

            //    entity.HasOne(d => d.Application)
            //        .WithMany(p => p.ESUserApps)
            //        .HasForeignKey(d => d.ApplicationId)
            //        .HasConstraintName("FK_ESUserApps_ESApplications");

            //    entity.HasOne(d => d.User)
            //        .WithMany(p => p.ESUserApps)
            //        .HasForeignKey(d => d.UserId)
            //        .HasConstraintName("FK_ESUserApps_AspNetUsers");
            //});

            //modelBuilder.Entity<ESUserPrivilege>(entity =>
            //{
            //    entity.HasKey(e => new { e.UserId, e.PrivilegeId })
            //        .HasName("PK_ESUserPrivileges");

            //    entity.ToTable("ESUserPrivileges");

            //    entity.Property(e => e.UserId).HasMaxLength(250);

            //    entity.HasOne(d => d.Privilege)
            //        .WithMany(p => p.ESUserPrivileges)
            //        .HasForeignKey(d => d.PrivilegeId)
            //        .HasConstraintName("FK_ESUserPrivileges_ESPrivileges");

            //    entity.HasOne(d => d.User)
            //        .WithMany(p => p.ESUserPrivileges)
            //        .HasForeignKey(d => d.UserId)
            //        .HasConstraintName("FK_ESUserPrivileges_AspNetUsers");
            //}); 
            #endregion

            base.OnModelCreating(modelBuilder);

            #region Replace all table, column name to snake case
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                // Replace table names
                entity.Relational().TableName = entity.Relational().TableName.ToSnakeCase(true);

                // Replace column names            
                foreach (var property in entity.GetProperties())
                {
                    property.Relational().ColumnName = property.Name.ToSnakeCase(true);
                }

                foreach (var key in entity.GetKeys())
                {
                    key.Relational().Name = key.Relational().Name.ToSnakeCase(true);
                }

                foreach (var key in entity.GetForeignKeys())
                {
                    key.Relational().Name = key.Relational().Name.ToSnakeCase(true);
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.Relational().Name = index.Relational().Name.ToSnakeCase(true);
                }
            }
            #endregion
        }

    }
}