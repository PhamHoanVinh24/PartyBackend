using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using ESEIM.Models;

namespace EIM.Models.Migrations
{
    [DbContext(typeof(EIMDBContext))]
    [Migration("20170811064420_UpdateTableUsers")]
    partial class UpdateTableUsers
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2");

            modelBuilder.Entity("ESEIM.Models.ApiClaim", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("ApiResourceId");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("ApiResourceId")
                        .HasName("IX_ApiClaims_ApiResourceId");

                    b.ToTable("ApiClaims");
                });

            modelBuilder.Entity("ESEIM.Models.ApiResource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<string>("DisplayName")
                        .HasMaxLength(200);

                    b.Property<bool?>("Enabled");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique()
                        .HasName("IX_ApiResources_Name");

                    b.ToTable("ApiResources");
                });

            modelBuilder.Entity("ESEIM.Models.ApiScope", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("ApiResourceId");

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<string>("DisplayName")
                        .HasMaxLength(200);

                    b.Property<bool?>("Emphasize");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.Property<bool?>("Required");

                    b.Property<bool?>("ShowInDiscoveryDocument");

                    b.HasKey("Id");

                    b.HasIndex("ApiResourceId")
                        .HasName("IX_ApiScopes_ApiResourceId");

                    b.HasIndex("Name")
                        .IsUnique()
                        .HasName("IX_ApiScopes_Name");

                    b.ToTable("ApiScopes");
                });

            modelBuilder.Entity("ESEIM.Models.ApiScopeClaim", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ApiScopeId");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("ApiScopeId")
                        .HasName("IX_ApiScopeClaims_ApiScopeId");

                    b.ToTable("ApiScopeClaims");
                });

            modelBuilder.Entity("ESEIM.Models.ApiSecret", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("ApiResourceId");

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<DateTime?>("Expiration");

                    b.Property<string>("Type")
                        .HasMaxLength(250);

                    b.Property<string>("Value")
                        .HasMaxLength(2000);

                    b.HasKey("Id");

                    b.HasIndex("ApiResourceId")
                        .HasName("IX_ApiSecrets_ApiResourceId");

                    b.ToTable("ApiSecrets");
                });

            modelBuilder.Entity("ESEIM.Models.AspNetRole", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(250);

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(255);

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<string>("Description");

                    b.Property<string>("Name")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedName")
                        .IsRequired()
                        .HasMaxLength(256);

                    b.Property<int?>("Ord");

                    b.Property<string>("Title")
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasName("RoleNameIndex");

                    b.ToTable("AspNetRoles");
                });

            modelBuilder.Entity("ESEIM.Models.AspNetUser", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(250);

                    b.Property<int>("AccessFailedCount");

                    b.Property<int?>("AccountExecutiveId");

                    b.Property<bool>("Active");

                    b.Property<int?>("BranchId");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken();

                    b.Property<string>("CreatedBy")
                        .HasMaxLength(255);

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<int?>("DepartmentId");

                    b.Property<string>("Email")
                        .HasMaxLength(256);

                    b.Property<bool>("EmailConfirmed");

                    b.Property<string>("FamilyName")
                        .HasMaxLength(255);

                    b.Property<string>("GivenName")
                        .HasMaxLength(255);

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("MiddleName")
                        .HasMaxLength(255);

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256);

                    b.Property<string>("NormalizedUserName")
                        .IsRequired()
                        .HasMaxLength(256);

                    b.Property<int?>("OfficeNumber");

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("Picture")
                        .HasMaxLength(255);

                    b.Property<int?>("ProfitCenterId");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName")
                        .HasMaxLength(256);

                    b.HasKey("Id");

                    b.HasIndex("AccountExecutiveId");

                    b.HasIndex("BranchId");

                    b.HasIndex("DepartmentId");

                    b.HasIndex("NormalizedEmail")
                        .HasName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasName("UserNameIndex");

                    b.HasIndex("ProfitCenterId");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("ESEIM.Models.Client", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("AbsoluteRefreshTokenLifetime");

                    b.Property<int?>("AccessTokenLifetime");

                    b.Property<int?>("AccessTokenType");

                    b.Property<bool?>("AllowAccessTokensViaBrowser");

                    b.Property<bool?>("AllowOfflineAccess");

                    b.Property<bool?>("AllowPlainTextPkce");

                    b.Property<bool?>("AllowRememberConsent");

                    b.Property<bool?>("AlwaysIncludeUserClaimsInIdToken")
                        .HasColumnName("AlwaysIncludeUCInIdToken");

                    b.Property<bool?>("AlwaysSendClientClaims");

                    b.Property<int?>("AuthorizationCodeLifetime");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.Property<string>("ClientName")
                        .HasMaxLength(200);

                    b.Property<string>("ClientUri")
                        .HasMaxLength(2000);

                    b.Property<bool?>("EnableLocalLogin");

                    b.Property<bool?>("Enabled");

                    b.Property<int?>("IdentityTokenLifetime");

                    b.Property<bool?>("IncludeJwtId");

                    b.Property<string>("LogoUri");

                    b.Property<bool?>("LogoutSessionRequired");

                    b.Property<string>("LogoutUri");

                    b.Property<bool?>("PrefixClientClaims");

                    b.Property<string>("ProtocolType")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.Property<int?>("RefreshTokenExpiration");

                    b.Property<int?>("RefreshTokenUsage");

                    b.Property<bool?>("RequireClientSecret");

                    b.Property<bool?>("RequireConsent");

                    b.Property<bool?>("RequirePkce");

                    b.Property<int?>("SlidingRefreshTokenLifetime");

                    b.Property<bool?>("UpdateAccessTokenClaimsOnRefresh")
                        .HasColumnName("UpdateAccessTCOnRefresh");

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .IsUnique()
                        .HasName("IX_Clients_ClientId");

                    b.ToTable("Clients");
                });

            modelBuilder.Entity("ESEIM.Models.ClientClaim", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientClaims_ClientId");

                    b.ToTable("ClientClaims");
                });

            modelBuilder.Entity("ESEIM.Models.ClientCorsOrigin", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("Origin")
                        .IsRequired()
                        .HasMaxLength(150);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientCorsOrigins_ClientId");

                    b.ToTable("ClientCorsOrigins");
                });

            modelBuilder.Entity("ESEIM.Models.ClientGrantType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("GrantType")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientGrantTypes_ClientId");

                    b.ToTable("ClientGrantTypes");
                });

            modelBuilder.Entity("ESEIM.Models.ClientIdPrestriction", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("Provider")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientIdPRestrictions_ClientId");

                    b.ToTable("ClientIdPRestrictions");
                });

            modelBuilder.Entity("ESEIM.Models.ClientPostLogoutRedirectUri", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("PostLogoutRedirectUri")
                        .IsRequired()
                        .HasMaxLength(2000);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientPostLogoutRedirectUris_ClientId");

                    b.ToTable("ClientPostLogoutRedirectUris");
                });

            modelBuilder.Entity("ESEIM.Models.ClientRedirectUri", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("RedirectUri")
                        .IsRequired()
                        .HasMaxLength(2000);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientRedirectUris_ClientId");

                    b.ToTable("ClientRedirectUris");
                });

            modelBuilder.Entity("ESEIM.Models.ClientScope", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("Scope")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientScopes_ClientId");

                    b.ToTable("ClientScopes");
                });

            modelBuilder.Entity("ESEIM.Models.ClientSecret", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClientId");

                    b.Property<string>("Description")
                        .HasMaxLength(2000);

                    b.Property<DateTime?>("Expiration");

                    b.Property<string>("Type")
                        .HasMaxLength(250);

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(2000);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .HasName("IX_ClientSecrets_ClientId");

                    b.ToTable("ClientSecrets");
                });

            modelBuilder.Entity("ESEIM.Models.ESAccessLog", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("AccessDate");

                    b.Property<string>("Action")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Application")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Description")
                        .HasMaxLength(450);

                    b.Property<string>("Ipaddress")
                        .HasColumnName("IPAddress")
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Resource")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.HasKey("Id");

                    b.ToTable("ESAccessLogs");
                });

            modelBuilder.Entity("ESEIM.Models.ESAction", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(50);

                    b.Property<string>("Description")
                        .HasMaxLength(255);

                    b.Property<int?>("Ord");

                    b.Property<int>("Seq")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("Id")
                        .IsUnique();

                    b.ToTable("ESActions");
                });

            modelBuilder.Entity("ESEIM.Models.ESApiClient", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .HasMaxLength(255);

                    b.Property<string>("Name")
                        .HasMaxLength(255);

                    b.Property<string>("Scopes")
                        .HasMaxLength(255);

                    b.Property<string>("Secret");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.ToTable("ESApiClients");
                });

            modelBuilder.Entity("ESEIM.Models.ESAppGResource", b =>
                {
                    b.Property<int>("ApplicationId");

                    b.Property<string>("GroupResourceId");

                    b.HasKey("ApplicationId", "GroupResourceId")
                        .HasName("PK_ESAppResources");

                    b.HasIndex("GroupResourceId");

                    b.ToTable("ESAppGResources");
                });

            modelBuilder.Entity("ESEIM.Models.ESApplication", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("AuthenticationScheme")
                        .HasMaxLength(255);

                    b.Property<string>("Authority")
                        .HasMaxLength(255);

                    b.Property<string>("ClientId")
                        .HasMaxLength(255);

                    b.Property<string>("ClientSecret")
                        .HasMaxLength(255);

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Description");

                    b.Property<string>("NameClaimType")
                        .HasMaxLength(255);

                    b.Property<int?>("Ord");

                    b.Property<bool?>("RequireHttps");

                    b.Property<string>("ResponseType")
                        .HasMaxLength(255);

                    b.Property<string>("RoleClaimType")
                        .HasMaxLength(255);

                    b.Property<string>("Scope")
                        .HasMaxLength(255);

                    b.Property<int>("Status");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("Code")
                        .IsUnique()
                        .HasName("IX_ESApplications");

                    b.ToTable("ESApplications");
                });

            modelBuilder.Entity("ESEIM.Models.ESClientConnect", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("ClientId");

                    b.Property<DateTime?>("ConnectDate");

                    b.Property<DateTime?>("DisconnectDate");

                    b.Property<string>("Ipaddress")
                        .HasColumnName("IPAddress")
                        .HasColumnType("varchar(50)");

                    b.Property<int?>("UserId");

                    b.HasKey("Id");

                    b.ToTable("ESClientConnects");
                });

            modelBuilder.Entity("ESEIM.Models.ESEndpoint", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<string>("Ipaddress")
                        .IsRequired()
                        .HasColumnName("IPAddress")
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.ToTable("ESEndpoints");
                });

            modelBuilder.Entity("ESEIM.Models.ESEndpointApp", b =>
                {
                    b.Property<int>("EndpointId");

                    b.Property<int>("ApplicationId");

                    b.Property<bool>("Allow");

                    b.HasKey("EndpointId", "ApplicationId")
                        .HasName("PK_ESEndpointApps");

                    b.HasIndex("ApplicationId");

                    b.ToTable("ESEndpointApps");
                });

            modelBuilder.Entity("ESEIM.Models.ESExtendAccount", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Account")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("varchar(50)");

                    b.Property<string>("UserId")
                        .HasMaxLength(250);

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("ESExtendAccounts");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupApp", b =>
                {
                    b.Property<int>("GroupId");

                    b.Property<int>("ApplicationId");

                    b.HasKey("GroupId", "ApplicationId")
                        .HasName("PK_ESGroupApps");

                    b.HasIndex("ApplicationId");

                    b.ToTable("ESGroupApps");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupParameter", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.HasKey("Id");

                    b.ToTable("ESGroupParameters");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupResource", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(50);

                    b.Property<int>("Seq")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("Id")
                        .IsUnique();

                    b.ToTable("ESGroupResources");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code");

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<string>("Description");

                    b.Property<string>("Title")
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.ToTable("ESGroupUsers");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupUserPrivilege", b =>
                {
                    b.Property<int>("GroupUserId");

                    b.Property<int>("PrivilegeId");

                    b.HasKey("GroupUserId", "PrivilegeId")
                        .HasName("PK_ESGroupUserPrivileges");

                    b.HasIndex("PrivilegeId");

                    b.ToTable("ESGroupUserPrivileges");
                });

            modelBuilder.Entity("ESEIM.Models.ESOauthClient", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("AccessTokenLifetime");

                    b.Property<string>("AllowedScopes")
                        .HasMaxLength(255);

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("ClientSecret")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Description")
                        .HasMaxLength(255);

                    b.Property<string>("GrantTypes")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Logo")
                        .HasMaxLength(255);

                    b.Property<string>("PostLogoutRedirectUris")
                        .HasMaxLength(255);

                    b.Property<string>("RedirectUris")
                        .HasMaxLength(255);

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("ClientId")
                        .IsUnique()
                        .HasName("IX_ESOAuthClients");

                    b.ToTable("ESOAuthClients");
                });

            modelBuilder.Entity("ESEIM.Models.ESOrganization", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<int?>("Ord");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("ESOrganizations");
                });

            modelBuilder.Entity("ESEIM.Models.ESOrgApp", b =>
                {
                    b.Property<int>("OrgId");

                    b.Property<int>("ApplicationId");

                    b.Property<bool>("Allow");

                    b.HasKey("OrgId", "ApplicationId")
                        .HasName("PK_ESOrgApps");

                    b.HasIndex("ApplicationId");

                    b.ToTable("ESOrgApps");
                });

            modelBuilder.Entity("ESEIM.Models.ESOrgPrivilege", b =>
                {
                    b.Property<int>("OrgId");

                    b.Property<int>("PrivilegeId");

                    b.HasKey("OrgId", "PrivilegeId")
                        .HasName("PK_ESOrgPrivileges");

                    b.HasIndex("PrivilegeId");

                    b.ToTable("ESOrgPrivileges");
                });

            modelBuilder.Entity("ESEIM.Models.ESParameter", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(525);

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<int?>("GroupId");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(250);

                    b.Property<string>("Value")
                        .HasMaxLength(525);

                    b.HasKey("Id");

                    b.HasIndex("GroupId");

                    b.HasIndex("ParentId");

                    b.ToTable("ESParameters");
                });

            modelBuilder.Entity("ESEIM.Models.ESPolicy", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.ToTable("ESPolicies");
                });

            modelBuilder.Entity("ESEIM.Models.ESPrivilege", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ActionId")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<int>("ResourceId");

                    b.HasKey("Id");

                    b.HasIndex("ActionId");

                    b.HasIndex("ResourceId");

                    b.ToTable("ESPrivileges");
                });

            modelBuilder.Entity("ESEIM.Models.ESResAttribute", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Key")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<int>("ResourceId");

                    b.Property<string>("Value")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("ResourceId");

                    b.ToTable("ESResAttributes");
                });

            modelBuilder.Entity("ESEIM.Models.ESResource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.Property<string>("GroupResourceId")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<int?>("Ord");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(255);

                    b.HasKey("Id");

                    b.HasIndex("GroupResourceId");

                    b.HasIndex("ParentId");

                    b.ToTable("ESResources");
                });

            modelBuilder.Entity("ESEIM.Models.ESRoleApp", b =>
                {
                    b.Property<string>("RoleId")
                        .HasMaxLength(250);

                    b.Property<int>("ApplicationId");

                    b.HasKey("RoleId", "ApplicationId")
                        .HasName("PK_ESRoleAPps");

                    b.HasIndex("ApplicationId");

                    b.ToTable("ESRoleApps");
                });

            modelBuilder.Entity("ESEIM.Models.ESRolePrivilege", b =>
                {
                    b.Property<string>("RoleId")
                        .HasMaxLength(250);

                    b.Property<int>("PrivilegeId");

                    b.HasKey("RoleId", "PrivilegeId")
                        .HasName("PK_ESRolePrivileges");

                    b.HasIndex("PrivilegeId");

                    b.ToTable("ESRolePrivileges");
                });

            modelBuilder.Entity("ESEIM.Models.ESUserApp", b =>
                {
                    b.Property<string>("UserId")
                        .HasMaxLength(250);

                    b.Property<int>("ApplicationId");

                    b.HasKey("UserId", "ApplicationId")
                        .HasName("PK_ESUserApps");

                    b.HasIndex("ApplicationId");

                    b.ToTable("ESUserApps");
                });

            modelBuilder.Entity("ESEIM.Models.ESUserInGroup", b =>
                {
                    b.Property<int>("GroupUserId");

                    b.Property<string>("UserId")
                        .HasMaxLength(50);

                    b.HasKey("GroupUserId", "UserId")
                        .HasName("PK_ESUserInGroups");

                    b.HasIndex("UserId");

                    b.ToTable("ESUserInGroups");
                });

            modelBuilder.Entity("ESEIM.Models.ESUserPrivilege", b =>
                {
                    b.Property<string>("UserId")
                        .HasMaxLength(250);

                    b.Property<int>("PrivilegeId");

                    b.HasKey("UserId", "PrivilegeId")
                        .HasName("PK_ESUserPrivileges");

                    b.HasIndex("PrivilegeId");

                    b.ToTable("ESUserPrivileges");
                });

            modelBuilder.Entity("ESEIM.Models.IdentityClaim", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("IdentityResourceId");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.HasKey("Id");

                    b.HasIndex("IdentityResourceId")
                        .HasName("IX_IdentityClaims_IdentityResourceId");

                    b.ToTable("IdentityClaims");
                });

            modelBuilder.Entity("ESEIM.Models.IdentityResource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .HasMaxLength(1000);

                    b.Property<string>("DisplayName")
                        .HasMaxLength(200);

                    b.Property<bool?>("Emphasize");

                    b.Property<bool?>("Enabled");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(200);

                    b.Property<bool?>("Required");

                    b.Property<bool?>("ShowInDiscoveryDocument");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique()
                        .HasName("IX_IdentityResources_Name");

                    b.ToTable("IdentityResources");
                });

            modelBuilder.Entity("ESEIM.Models.VIBAppFunction", b =>
                {
                    b.Property<int>("ApplicationId");

                    b.Property<int>("FunctionId");

                    b.HasKey("ApplicationId", "FunctionId");

                    b.HasIndex("FunctionId");

                    b.ToTable("VIBAppFunction");
                });

            modelBuilder.Entity("ESEIM.Models.VIBAppGroupResource", b =>
                {
                    b.Property<int>("ApplicationId");

                    b.Property<int>("GroupResourceId");

                    b.HasKey("ApplicationId", "GroupResourceId");

                    b.HasIndex("GroupResourceId");

                    b.ToTable("VIBAppGroupResource");
                });

            modelBuilder.Entity("ESEIM.Models.VIBApplication", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("AuthenticationScheme")
                        .HasMaxLength(255);

                    b.Property<string>("Authority")
                        .HasMaxLength(255);

                    b.Property<string>("ClientId")
                        .HasMaxLength(255);

                    b.Property<string>("ClientSecret")
                        .HasMaxLength(255);

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<string>("NameClaimType")
                        .HasMaxLength(255);

                    b.Property<int?>("Ord");

                    b.Property<bool?>("RequireHttps");

                    b.Property<string>("ResponseType")
                        .HasMaxLength(255);

                    b.Property<string>("RoleClaimType")
                        .HasMaxLength(255);

                    b.Property<string>("Scope")
                        .HasMaxLength(255);

                    b.Property<int>("Status");

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.ToTable("VIBApplication");
                });

            modelBuilder.Entity("ESEIM.Models.VIBFunction", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<int?>("Ord");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("VIBFunction");
                });

            modelBuilder.Entity("ESEIM.Models.VIBGroupResource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.ToTable("VIBGroupResource");
                });

            modelBuilder.Entity("ESEIM.Models.VIBGroupUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.ToTable("VIBGroupUser");
                });

            modelBuilder.Entity("ESEIM.Models.VIBGroupUserPrivilege", b =>
                {
                    b.Property<int>("GroupUserId");

                    b.Property<int>("PrivilegeId");

                    b.HasKey("GroupUserId", "PrivilegeId");

                    b.HasIndex("PrivilegeId");

                    b.ToTable("VIBGroupUserPrivilege");
                });

            modelBuilder.Entity("ESEIM.Models.VIBLanguage", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("CreatedBy");

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<string>("Culture")
                        .HasMaxLength(10);

                    b.Property<int?>("DeletedBy");

                    b.Property<DateTime?>("DeletedDate");

                    b.Property<string>("DisplayName")
                        .HasMaxLength(256);

                    b.Property<string>("Icon")
                        .HasMaxLength(128);

                    b.Property<bool?>("IsDefault");

                    b.Property<bool>("IsDeleted");

                    b.Property<bool>("IsEnabled");

                    b.Property<int>("Ordering");

                    b.Property<int?>("UpdatedBy");

                    b.Property<DateTime?>("UpdatedDate");

                    b.HasKey("Id");

                    b.ToTable("VIBLanguage");
                });

            modelBuilder.Entity("ESEIM.Models.VIBLanguageText", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Caption")
                        .HasMaxLength(500);

                    b.Property<int?>("CreatedBy");

                    b.Property<DateTime?>("CreatedDate");

                    b.Property<int?>("DeletedBy");

                    b.Property<DateTime?>("DeletedDate");

                    b.Property<bool>("IsDeleted");

                    b.Property<int>("LanguageId");

                    b.Property<int?>("UpdatedBy");

                    b.Property<DateTime?>("UpdatedDate");

                    b.Property<string>("Value");

                    b.HasKey("Id");

                    b.HasIndex("LanguageId");

                    b.ToTable("VIBLanguageText");
                });

            modelBuilder.Entity("ESEIM.Models.VIBOrganization", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<string>("Description")
                        .HasMaxLength(500);

                    b.Property<int?>("Ord");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.HasIndex("ParentId");

                    b.ToTable("VIBOrganization");
                });

            modelBuilder.Entity("ESEIM.Models.VIBPrivilege", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("FunctionId");

                    b.Property<int>("ResourceId");

                    b.HasKey("Id");

                    b.HasIndex("FunctionId");

                    b.HasIndex("ResourceId");

                    b.ToTable("VIBPrivilege");
                });

            modelBuilder.Entity("ESEIM.Models.VIBResource", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Api")
                        .HasMaxLength(255);

                    b.Property<string>("Code")
                        .HasMaxLength(20);

                    b.Property<string>("Description")
                        .HasMaxLength(2000);

                    b.Property<int>("GroupResourceId");

                    b.Property<int?>("Ord");

                    b.Property<int?>("ParentId");

                    b.Property<string>("Path")
                        .HasMaxLength(255);

                    b.Property<string>("Title")
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.HasIndex("GroupResourceId");

                    b.HasIndex("ParentId");

                    b.ToTable("VIBResource");
                });

            modelBuilder.Entity("ESEIM.Models.VIBUserInGroup", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<int>("GroupUserId");

                    b.HasKey("UserId", "GroupUserId");

                    b.HasIndex("GroupUserId");

                    b.ToTable("VIBUserInGroup");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("RoleId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ClaimType");

                    b.Property<string>("ClaimValue");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider");

                    b.Property<string>("ProviderKey");

                    b.Property<string>("ProviderDisplayName");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("RoleId");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId");

                    b.Property<string>("LoginProvider");

                    b.Property<string>("Name");

                    b.Property<string>("Value");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens");
                });

            modelBuilder.Entity("ESEIM.Models.ApiClaim", b =>
                {
                    b.HasOne("ESEIM.Models.ApiResource", "ApiResource")
                        .WithMany("ApiClaims")
                        .HasForeignKey("ApiResourceId");
                });

            modelBuilder.Entity("ESEIM.Models.ApiScope", b =>
                {
                    b.HasOne("ESEIM.Models.ApiResource", "ApiResources")
                        .WithMany("ApiScopes")
                        .HasForeignKey("ApiResourceId");
                });

            modelBuilder.Entity("ESEIM.Models.ApiScopeClaim", b =>
                {
                    b.HasOne("ESEIM.Models.ApiScope", "ApiScope")
                        .WithMany("ApiScopeClaims")
                        .HasForeignKey("ApiScopeId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ApiSecret", b =>
                {
                    b.HasOne("ESEIM.Models.ApiResource", "ApiResources")
                        .WithMany("ApiSecrets")
                        .HasForeignKey("ApiResourceId");
                });

            modelBuilder.Entity("ESEIM.Models.AspNetUser", b =>
                {
                    b.HasOne("ESEIM.Models.VIBOrganization", "AccountExecutive")
                        .WithMany("AccountExecutiveUsers")
                        .HasForeignKey("AccountExecutiveId");

                    b.HasOne("ESEIM.Models.VIBOrganization", "Branch")
                        .WithMany("BranchUsers")
                        .HasForeignKey("BranchId");

                    b.HasOne("ESEIM.Models.VIBOrganization", "Department")
                        .WithMany("DepartmentUsers")
                        .HasForeignKey("DepartmentId");

                    b.HasOne("ESEIM.Models.VIBOrganization", "ProfitCenter")
                        .WithMany("ProfitCenterUsers")
                        .HasForeignKey("ProfitCenterId");
                });

            modelBuilder.Entity("ESEIM.Models.ClientClaim", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientClaims")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientCorsOrigin", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientCorsOrigins")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientGrantType", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientGrantTypes")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientIdPrestriction", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientIdPrestrictions")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientPostLogoutRedirectUri", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientPostLogoutRedirectUris")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientRedirectUri", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientRedirectUris")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientScope", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientScopes")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ClientSecret", b =>
                {
                    b.HasOne("ESEIM.Models.Client", "Clients")
                        .WithMany("ClientSecrets")
                        .HasForeignKey("ClientId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESAppGResource", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Application")
                        .WithMany("ESAppResources")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESAppResources_ESApplications")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESGroupResource", "GroupResource")
                        .WithMany("ESAppResources")
                        .HasForeignKey("GroupResourceId")
                        .HasConstraintName("FK_ESAppGResources_ESResources")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESEndpointApp", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Application")
                        .WithMany("ESEndpointApps")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESEndpointApps_ESApplications")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESEndpoint", "Endpoint")
                        .WithMany("ESEndpointApps")
                        .HasForeignKey("EndpointId")
                        .HasConstraintName("FK_ESEndpointApps_ESEndpoints")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESExtendAccount", b =>
                {
                    b.HasOne("ESEIM.Models.AspNetUser", "User")
                        .WithMany("ESExtendAccounts")
                        .HasForeignKey("UserId")
                        .HasConstraintName("FK_ESExtendAccounts_AspNetUsers")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupApp", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Applications")
                        .WithMany("ESGroupApps")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESGroupApps_ESApplications");

                    b.HasOne("ESEIM.Models.ESGroupUser", "Groups")
                        .WithMany("ESGroupApps")
                        .HasForeignKey("GroupId")
                        .HasConstraintName("FK_ESGroupApps_ESGroupUsers");
                });

            modelBuilder.Entity("ESEIM.Models.ESGroupUserPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.ESGroupUser", "GroupUsers")
                        .WithMany("ESGroupUserPrivileges")
                        .HasForeignKey("GroupUserId")
                        .HasConstraintName("FK_ESGroupUserPrivileges_ESGroupUsers")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESPrivilege", "Privileges")
                        .WithMany("ESGroupUserPrivileges")
                        .HasForeignKey("PrivilegeId")
                        .HasConstraintName("FK_ESGroupUserPrivileges_ESPrivileges")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESOrganization", b =>
                {
                    b.HasOne("ESEIM.Models.ESOrganization", "Parent")
                        .WithMany("InverseParent")
                        .HasForeignKey("ParentId")
                        .HasConstraintName("FK_ESOrganizations_ESOrganizations");
                });

            modelBuilder.Entity("ESEIM.Models.ESOrgApp", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Application")
                        .WithMany("ESOrgApps")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESOrgApps_ESApplications")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESOrganization", "Org")
                        .WithMany("ESOrgApps")
                        .HasForeignKey("OrgId")
                        .HasConstraintName("FK_ESOrgApps_ESOrganizations")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESOrgPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.ESOrganization", "Org")
                        .WithMany("ESOrgPrivileges")
                        .HasForeignKey("OrgId")
                        .HasConstraintName("FK_ESOrgPrivileges_ESOrganizations")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESPrivilege", "Privilege")
                        .WithMany("ESOrgPrivileges")
                        .HasForeignKey("PrivilegeId")
                        .HasConstraintName("FK_ESOrgPrivileges_ESPrivileges")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESParameter", b =>
                {
                    b.HasOne("ESEIM.Models.ESGroupParameter", "Group")
                        .WithMany("ESParameters")
                        .HasForeignKey("GroupId")
                        .HasConstraintName("FK_ESParameters_ESGroupParameters");

                    b.HasOne("ESEIM.Models.ESParameter", "Parent")
                        .WithMany("InverseParent")
                        .HasForeignKey("ParentId")
                        .HasConstraintName("FK_ESParameters_ESParameters");
                });

            modelBuilder.Entity("ESEIM.Models.ESPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.ESAction", "Action")
                        .WithMany("ESPrivileges")
                        .HasForeignKey("ActionId")
                        .HasConstraintName("FK_ESPrivileges_ESActions")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.ESResource", "Resource")
                        .WithMany("ESPrivileges")
                        .HasForeignKey("ResourceId")
                        .HasConstraintName("FK_ESPrivileges_ESResources")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESResAttribute", b =>
                {
                    b.HasOne("ESEIM.Models.ESResource", "Resource")
                        .WithMany("ESResAttributes")
                        .HasForeignKey("ResourceId")
                        .HasConstraintName("FK_ESResAttributes_ESResources")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESResource", b =>
                {
                    b.HasOne("ESEIM.Models.ESGroupResource", "TypeNavigation")
                        .WithMany("ESResources")
                        .HasForeignKey("GroupResourceId")
                        .HasConstraintName("FK_ESResources_ESResTypes");

                    b.HasOne("ESEIM.Models.ESResource", "Parent")
                        .WithMany("InverseParent")
                        .HasForeignKey("ParentId")
                        .HasConstraintName("FK_ESResources_ESResources");
                });

            modelBuilder.Entity("ESEIM.Models.ESRoleApp", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Application")
                        .WithMany("ESRoleApps")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESRoleAPps_ESApplications")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetRole", "Role")
                        .WithMany("ESRoleApps")
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK_ESRoleAPps_AspNetRoles")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESRolePrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.ESPrivilege", "Privilege")
                        .WithMany("ESRolePrivileges")
                        .HasForeignKey("PrivilegeId")
                        .HasConstraintName("FK_ESRolePrivileges_ESPrivileges")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetRole", "Role")
                        .WithMany("ESRolePrivileges")
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK_ESRolePrivileges_AspNetRoles")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESUserApp", b =>
                {
                    b.HasOne("ESEIM.Models.ESApplication", "Application")
                        .WithMany("ESUserApps")
                        .HasForeignKey("ApplicationId")
                        .HasConstraintName("FK_ESUserApps_ESApplications")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetUser", "User")
                        .WithMany("ESUserApps")
                        .HasForeignKey("UserId")
                        .HasConstraintName("FK_ESUserApps_AspNetUsers")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.ESUserInGroup", b =>
                {
                    b.HasOne("ESEIM.Models.ESGroupUser", "GroupUser")
                        .WithMany("ESUserInGroups")
                        .HasForeignKey("GroupUserId")
                        .HasConstraintName("FK_ESUserInGroups_ESGroupUsers");

                    b.HasOne("ESEIM.Models.AspNetUser", "User")
                        .WithMany("ESUserInGroups")
                        .HasForeignKey("UserId")
                        .HasConstraintName("FK_ESUserInGroups_AspNetUsers");
                });

            modelBuilder.Entity("ESEIM.Models.ESUserPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.ESPrivilege", "Privilege")
                        .WithMany("ESUserPrivileges")
                        .HasForeignKey("PrivilegeId")
                        .HasConstraintName("FK_ESUserPrivileges_ESPrivileges")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetUser", "User")
                        .WithMany("ESUserPrivileges")
                        .HasForeignKey("UserId")
                        .HasConstraintName("FK_ESUserPrivileges_AspNetUsers")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.IdentityClaim", b =>
                {
                    b.HasOne("ESEIM.Models.IdentityResource", "IdentityResources")
                        .WithMany("IdentityClaims")
                        .HasForeignKey("IdentityResourceId");
                });

            modelBuilder.Entity("ESEIM.Models.VIBAppFunction", b =>
                {
                    b.HasOne("ESEIM.Models.VIBApplication", "Application")
                        .WithMany("AppFunctions")
                        .HasForeignKey("ApplicationId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.VIBFunction", "Function")
                        .WithMany("AppFunctions")
                        .HasForeignKey("FunctionId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.VIBAppGroupResource", b =>
                {
                    b.HasOne("ESEIM.Models.VIBApplication", "Application")
                        .WithMany("AppGroupResources")
                        .HasForeignKey("ApplicationId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.VIBGroupResource", "GroupResource")
                        .WithMany("AppGroupResources")
                        .HasForeignKey("GroupResourceId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.VIBFunction", b =>
                {
                    b.HasOne("ESEIM.Models.VIBFunction", "Parent")
                        .WithMany()
                        .HasForeignKey("ParentId");
                });

            modelBuilder.Entity("ESEIM.Models.VIBGroupUserPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.VIBGroupUser", "GroupUser")
                        .WithMany("VIBGroupUserPrivileges")
                        .HasForeignKey("GroupUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.VIBPrivilege", "Privilege")
                        .WithMany()
                        .HasForeignKey("PrivilegeId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.VIBLanguageText", b =>
                {
                    b.HasOne("ESEIM.Models.VIBLanguage", "Language")
                        .WithMany("LanguageTexts")
                        .HasForeignKey("LanguageId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.VIBOrganization", b =>
                {
                    b.HasOne("ESEIM.Models.VIBOrganization", "Parent")
                        .WithMany()
                        .HasForeignKey("ParentId");
                });

            modelBuilder.Entity("ESEIM.Models.VIBPrivilege", b =>
                {
                    b.HasOne("ESEIM.Models.VIBFunction", "Function")
                        .WithMany("Privileges")
                        .HasForeignKey("FunctionId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.VIBResource", "Resource")
                        .WithMany("Privileges")
                        .HasForeignKey("ResourceId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("ESEIM.Models.VIBResource", b =>
                {
                    b.HasOne("ESEIM.Models.VIBGroupResource", "GroupResource")
                        .WithMany("Resources")
                        .HasForeignKey("GroupResourceId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.VIBResource", "Parent")
                        .WithMany()
                        .HasForeignKey("ParentId");
                });

            modelBuilder.Entity("ESEIM.Models.VIBUserInGroup", b =>
                {
                    b.HasOne("ESEIM.Models.VIBGroupUser", "GroupUser")
                        .WithMany("VIBUserInGroups")
                        .HasForeignKey("GroupUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetUser", "User")
                        .WithMany("VIBUserInGroups")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("ESEIM.Models.AspNetRole")
                        .WithMany("Claims")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("ESEIM.Models.AspNetUser")
                        .WithMany("Claims")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("ESEIM.Models.AspNetUser")
                        .WithMany("Logins")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<string>", b =>
                {
                    b.HasOne("ESEIM.Models.AspNetRole")
                        .WithMany("Users")
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ESEIM.Models.AspNetUser")
                        .WithMany("Roles")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
