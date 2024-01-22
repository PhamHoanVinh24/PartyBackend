using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Host.DbContexts;

namespace Host.DbContexts.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20170720111800_CreateSchemaHost")]
    partial class CreateSchemaHost
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2");

            modelBuilder.Entity("Host.Entities.ApplicationUser", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<int>("AccessFailedCount");

                b.Property<string>("ConcurrencyStamp")
                    .IsConcurrencyToken();

                b.Property<string>("Email")
                    .HasMaxLength(256);

                b.Property<bool>("EmailConfirmed");

                b.Property<string>("FamilyName");

                b.Property<string>("GivenName");

                b.Property<bool>("LockoutEnabled");

                b.Property<DateTimeOffset?>("LockoutEnd");

                b.Property<string>("MiddleName");

                b.Property<string>("NormalizedEmail")
                    .HasMaxLength(256);

                b.Property<string>("NormalizedUserName")
                    .HasMaxLength(256);

                b.Property<int>("OfficeNumber");

                b.Property<string>("PasswordHash");

                b.Property<string>("PhoneNumber");

                b.Property<bool>("PhoneNumberConfirmed");

                b.Property<string>("Picture");

                b.Property<string>("SecurityStamp");

                b.Property<bool>("TwoFactorEnabled");

                b.Property<string>("UserName")
                    .HasMaxLength(256);

                b.HasKey("Id");

                b.HasIndex("NormalizedEmail")
                    .HasName("EmailIndex");

                b.HasIndex("NormalizedUserName")
                    .IsUnique()
                    .HasName("UserNameIndex");

                b.ToTable("AspNetUsers");
            });

            modelBuilder.Entity("Host.Entities.AspNetRole", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("ConcurrencyStamp")
                    .IsConcurrencyToken();

                b.Property<string>("Name")
                    .HasMaxLength(256);

                b.Property<string>("NormalizedName")
                    .HasMaxLength(256);

                b.HasKey("Id");

                b.HasIndex("NormalizedName")
                    .IsUnique()
                    .HasName("RoleNameIndex");

                b.ToTable("AspNetRoles");
            });

            modelBuilder.Entity("Host.Entities.ESAccessLog", b =>
            {
                b.Property<long>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<DateTime>("AccessDate")
                    .HasColumnType("datetime");

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

            modelBuilder.Entity("Host.Entities.ESAction", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("varchar(50)");

                b.Property<string>("Description")
                    .HasMaxLength(255);

                b.Property<int?>("Ord");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESActions");
            });

            modelBuilder.Entity("Host.Entities.ESApiClient", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Description")
                    .HasMaxLength(500);

                b.Property<string>("Name")
                    .IsRequired()
                    .HasMaxLength(255);

                b.Property<string>("Scopes")
                    .HasMaxLength(255);

                b.Property<string>("Secret")
                    .HasMaxLength(255);

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESApiClients");
            });

            modelBuilder.Entity("Host.Entities.ESAppGResource", b =>
            {
                b.Property<int>("ApplicationId");

                b.Property<string>("GroupResourceId");

                b.HasKey("ApplicationId", "GroupResourceId")
                    .HasName("PK_ESAppResources");

                b.HasIndex("GroupResourceId");

                b.ToTable("ESAppGResources");
            });

            modelBuilder.Entity("Host.Entities.ESApplication", b =>
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

            modelBuilder.Entity("Host.Entities.ESClientConnect", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<int?>("ClientId");

                b.Property<DateTime?>("ConnectDate")
                    .HasColumnType("datetime");

                b.Property<DateTime?>("DisconnectDate")
                    .HasColumnType("datetime");

                b.Property<string>("Ipaddress")
                    .HasColumnName("IPAddress")
                    .HasColumnType("varchar(50)");

                b.Property<int?>("UserId");

                b.HasKey("Id");

                b.ToTable("ESClientConnects");
            });

            modelBuilder.Entity("Host.Entities.ESEmailConfig", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Code")
                    .IsRequired()
                    .HasMaxLength(50);

                b.Property<string>("Email")
                    .IsRequired()
                    .HasMaxLength(255);

                b.Property<string>("Imap")
                    .HasColumnName("IMAP")
                    .HasMaxLength(255);

                b.Property<int?>("Imapport")
                    .HasColumnName("IMAPPort");

                b.Property<bool?>("Imapssl");

                b.Property<string>("Password")
                    .HasMaxLength(255);

                b.Property<string>("Pop3")
                    .HasColumnName("POP3")
                    .HasMaxLength(255);

                b.Property<int?>("Pop3port")
                    .HasColumnName("POP3Port");

                b.Property<bool?>("Pop3ssl");

                b.Property<string>("Smtp")
                    .HasColumnName("SMTP")
                    .HasMaxLength(255);

                b.Property<int?>("Smtpport")
                    .HasColumnName("SMTPPort");

                b.Property<bool?>("Smtpssl");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESEmailConfigs");
            });

            modelBuilder.Entity("Host.Entities.ESEmailInBox", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Body")
                    .HasColumnType("ntext");

                b.Property<string>("From")
                    .HasMaxLength(255);

                b.Property<string>("IdEmail")
                    .HasMaxLength(255);

                b.Property<DateTime?>("SendDate")
                    .HasColumnType("datetime");

                b.Property<string>("Subject")
                    .HasMaxLength(255);

                b.Property<string>("To")
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESEmailInBoxs");
            });

            modelBuilder.Entity("Host.Entities.ESEndpoint", b =>
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

            modelBuilder.Entity("Host.Entities.ESEndpointApp", b =>
            {
                b.Property<int>("EndpointId");

                b.Property<int>("ApplicationId");

                b.Property<bool>("Allow");

                b.HasKey("EndpointId", "ApplicationId")
                    .HasName("PK_ESEndpointApps");

                b.HasIndex("ApplicationId");

                b.ToTable("ESEndpointApps");
            });

            modelBuilder.Entity("Host.Entities.ESExtendAccount", b =>
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

            modelBuilder.Entity("Host.Entities.ESGroupParameter", b =>
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

            modelBuilder.Entity("Host.Entities.ESGroupResource", b =>
            {
                b.Property<string>("Id")
                    .ValueGeneratedOnAdd()
                    .HasMaxLength(50);

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESGroupResources");
            });

            modelBuilder.Entity("Host.Entities.ESMessageAttribute", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Key")
                    .IsRequired()
                    .HasMaxLength(50);

                b.Property<int>("MessageQueueId");

                b.Property<string>("Value")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.HasIndex("MessageQueueId");

                b.ToTable("ESMessageAttribute");
            });

            modelBuilder.Entity("Host.Entities.ESMessageQueue", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Body");

                b.Property<DateTime?>("CreatedDate")
                    .HasColumnType("datetime");

                b.Property<string>("Subject")
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.ToTable("ESMessageQueue");
            });

            modelBuilder.Entity("Host.Entities.ESMessageReceiver", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<string>("Email")
                    .HasMaxLength(255);

                b.Property<int>("MessageQueueId");

                b.Property<string>("Mobile")
                    .HasMaxLength(20);

                b.Property<int>("S1");

                b.Property<int>("S2");

                b.HasKey("Id");

                b.HasIndex("MessageQueueId");

                b.ToTable("ESMessageReceiver");
            });

            modelBuilder.Entity("Host.Entities.ESOauthClient", b =>
            {
                b.Property<int>("Id")
                    .ValueGeneratedOnAdd();

                b.Property<int?>("AccessTokenLifetime");

                b.Property<bool?>("AllowAccessTokensViaBrowser");

                b.Property<string>("AllowedCorsOrigins");

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

                b.Property<string>("LogoutUri");

                b.Property<string>("PostLogoutRedirectUris")
                    .HasMaxLength(255);

                b.Property<string>("RedirectUris")
                    .HasMaxLength(255);

                b.Property<bool?>("RequireConsent");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasMaxLength(255);

                b.HasKey("Id");

                b.HasIndex("ClientId")
                    .IsUnique()
                    .HasName("IX_ESOAuthClients");

                b.ToTable("ESOAuthClients");
            });

            modelBuilder.Entity("Host.Entities.ESOrganization", b =>
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

            modelBuilder.Entity("Host.Entities.ESOrgApp", b =>
            {
                b.Property<int>("OrgId");

                b.Property<int>("ApplicationId");

                b.Property<bool>("Allow");

                b.HasKey("OrgId", "ApplicationId")
                    .HasName("PK_ESOrgApps");

                b.HasIndex("ApplicationId");

                b.ToTable("ESOrgApps");
            });

            modelBuilder.Entity("Host.Entities.ESOrgPrivilege", b =>
            {
                b.Property<int>("OrgId");

                b.Property<int>("PrivilegeId");

                b.HasKey("OrgId", "PrivilegeId")
                    .HasName("PK_ESOrgPrivileges");

                b.HasIndex("PrivilegeId");

                b.ToTable("ESOrgPrivileges");
            });

            modelBuilder.Entity("Host.Entities.VIBParameter", b =>
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

                b.ToTable("VIBParameter");
            });

            modelBuilder.Entity("Host.Entities.ESPolicy", b =>
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

            modelBuilder.Entity("Host.Entities.ESPrivilege", b =>
            {
                b.Property<int>("Id");

                b.Property<string>("ActionId")
                    .IsRequired()
                    .HasColumnType("varchar(50)");

                b.Property<int>("ResourceId");

                b.HasKey("Id");

                b.HasIndex("ActionId");

                b.HasIndex("ResourceId");

                b.ToTable("ESPrivileges");
            });

            modelBuilder.Entity("Host.Entities.ESResAttribute", b =>
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

            modelBuilder.Entity("Host.Entities.ESResource", b =>
            {
                b.Property<int>("Id");

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

            modelBuilder.Entity("Host.Entities.ESRoleApp", b =>
            {
                b.Property<string>("RoleId")
                    .HasMaxLength(250);

                b.Property<int>("ApplicationId");

                b.Property<bool>("Allow");

                b.HasKey("RoleId", "ApplicationId")
                    .HasName("PK_ESRoleAPps");

                b.HasIndex("ApplicationId");

                b.ToTable("ESRoleApps");
            });

            modelBuilder.Entity("Host.Entities.ESRolePrivilege", b =>
            {
                b.Property<string>("RoleId")
                    .HasMaxLength(250);

                b.Property<int>("PrivilegeId");

                b.HasKey("RoleId", "PrivilegeId")
                    .HasName("PK_ESRolePrivileges");

                b.HasIndex("PrivilegeId");

                b.ToTable("ESRolePrivileges");
            });

            modelBuilder.Entity("Host.Entities.ESUserApp", b =>
            {
                b.Property<string>("UserId")
                    .HasMaxLength(250);

                b.Property<int>("ApplicationId");

                b.Property<bool>("Allow");

                b.HasKey("UserId", "ApplicationId")
                    .HasName("PK_ESUserApps");

                b.HasIndex("ApplicationId");

                b.ToTable("ESUserApps");
            });

            modelBuilder.Entity("Host.Entities.ESUserPrivilege", b =>
            {
                b.Property<string>("UserId")
                    .HasMaxLength(250);

                b.Property<int>("PrivilegeId");

                b.HasKey("UserId", "PrivilegeId")
                    .HasName("PK_ESUserPrivileges");

                b.HasIndex("PrivilegeId");

                b.ToTable("ESUserPrivileges");
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

            modelBuilder.Entity("Host.Entities.ESAppGResource", b =>
            {
                b.HasOne("Host.Entities.ESApplication", "Application")
                    .WithMany("ESAppResources")
                    .HasForeignKey("ApplicationId")
                    .HasConstraintName("FK_ESAppResources_ESApplications")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ESGroupResource", "GroupResource")
                    .WithMany("ESAppResources")
                    .HasForeignKey("GroupResourceId")
                    .HasConstraintName("FK_ESAppGResources_ESResources")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESEndpointApp", b =>
            {
                b.HasOne("Host.Entities.ESApplication", "Application")
                    .WithMany("ESEndpointApps")
                    .HasForeignKey("ApplicationId")
                    .HasConstraintName("FK_ESEndpointApps_ESApplications")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ESEndpoint", "Endpoint")
                    .WithMany("ESEndpointApps")
                    .HasForeignKey("EndpointId")
                    .HasConstraintName("FK_ESEndpointApps_ESEndpoints")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESExtendAccount", b =>
            {
                b.HasOne("Host.Entities.ApplicationUser", "User")
                    .WithMany("ESExtendAccounts")
                    .HasForeignKey("UserId");
            });

            modelBuilder.Entity("Host.Entities.ESMessageAttribute", b =>
            {
                b.HasOne("Host.Entities.ESMessageQueue", "MessageQueue")
                    .WithMany("ESMessageAttributes")
                    .HasForeignKey("MessageQueueId")
                    .HasConstraintName("FK_ESMessageAttribute_ESMessageQueue");
            });

            modelBuilder.Entity("Host.Entities.ESMessageReceiver", b =>
            {
                b.HasOne("Host.Entities.ESMessageQueue", "MessageQueue")
                    .WithMany("ESMessageReceivers")
                    .HasForeignKey("MessageQueueId")
                    .HasConstraintName("FK_ESMessageReceiver_ESMessageQueue");
            });

            modelBuilder.Entity("Host.Entities.ESOrganization", b =>
            {
                b.HasOne("Host.Entities.ESOrganization", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentId")
                    .HasConstraintName("FK_ESOrganizations_ESOrganizations");
            });

            modelBuilder.Entity("Host.Entities.ESOrgApp", b =>
            {
                b.HasOne("Host.Entities.ESApplication", "Application")
                    .WithMany("ESOrgApps")
                    .HasForeignKey("ApplicationId")
                    .HasConstraintName("FK_ESOrgApps_ESApplications")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ESOrganization", "Org")
                    .WithMany("ESOrgApps")
                    .HasForeignKey("OrgId")
                    .HasConstraintName("FK_ESOrgApps_ESOrganizations")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESOrgPrivilege", b =>
            {
                b.HasOne("Host.Entities.ESOrganization", "Org")
                    .WithMany("ESOrgPrivileges")
                    .HasForeignKey("OrgId")
                    .HasConstraintName("FK_ESOrgPrivileges_ESOrganizations")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ESPrivilege", "Privilege")
                    .WithMany("ESOrgPrivileges")
                    .HasForeignKey("PrivilegeId")
                    .HasConstraintName("FK_ESOrgPrivileges_ESPrivileges")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.VIBParameter", b =>
            {
                b.HasOne("Host.Entities.ESGroupParameter", "Group")
                    .WithMany("VIBParameters")
                    .HasForeignKey("GroupId")
                    .HasConstraintName("FK_ESParameters_ESGroupParameters");

                b.HasOne("Host.Entities.VIBParameter", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentId")
                    .HasConstraintName("FK_ESParameters_ESParameters");
            });

            modelBuilder.Entity("Host.Entities.ESPrivilege", b =>
            {
                b.HasOne("Host.Entities.ESAction", "Action")
                    .WithMany("ESPrivileges")
                    .HasForeignKey("ActionId")
                    .HasConstraintName("FK_ESPrivileges_ESActions")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ESResource", "Resource")
                    .WithMany("ESPrivileges")
                    .HasForeignKey("ResourceId")
                    .HasConstraintName("FK_ESPrivileges_ESResources")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESResAttribute", b =>
            {
                b.HasOne("Host.Entities.ESResource", "Resource")
                    .WithMany("ESResAttributes")
                    .HasForeignKey("ResourceId")
                    .HasConstraintName("FK_ESResAttributes_ESResources")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESResource", b =>
            {
                b.HasOne("Host.Entities.ESGroupResource", "TypeNavigation")
                    .WithMany("ESResources")
                    .HasForeignKey("GroupResourceId")
                    .HasConstraintName("FK_ESResources_ESResTypes");

                b.HasOne("Host.Entities.ESResource", "Parent")
                    .WithMany("InverseParent")
                    .HasForeignKey("ParentId")
                    .HasConstraintName("FK_ESResources_ESResources");
            });

            modelBuilder.Entity("Host.Entities.ESRoleApp", b =>
            {
                b.HasOne("Host.Entities.ESApplication", "Application")
                    .WithMany("ESRoleApps")
                    .HasForeignKey("ApplicationId")
                    .HasConstraintName("FK_ESRoleAPps_ESApplications")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.AspNetRole", "Role")
                    .WithMany("ESRoleApps")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_ESRoleAPps_AspNetRoles")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESRolePrivilege", b =>
            {
                b.HasOne("Host.Entities.ESPrivilege", "Privilege")
                    .WithMany("ESRolePrivileges")
                    .HasForeignKey("PrivilegeId")
                    .HasConstraintName("FK_ESRolePrivileges_ESPrivileges")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.AspNetRole", "Role")
                    .WithMany("ESRolePrivileges")
                    .HasForeignKey("RoleId")
                    .HasConstraintName("FK_ESRolePrivileges_AspNetRoles")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESUserApp", b =>
            {
                b.HasOne("Host.Entities.ESApplication", "Application")
                    .WithMany("ESUserApps")
                    .HasForeignKey("ApplicationId")
                    .HasConstraintName("FK_ESUserApps_ESApplications")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ApplicationUser", "User")
                    .WithMany("ESUserApps")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Host.Entities.ESUserPrivilege", b =>
            {
                b.HasOne("Host.Entities.ESPrivilege", "Privilege")
                    .WithMany("ESUserPrivileges")
                    .HasForeignKey("PrivilegeId")
                    .HasConstraintName("FK_ESUserPrivileges_ESPrivileges")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ApplicationUser", "User")
                    .WithMany("ESUserPrivileges")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityRoleClaim<string>", b =>
            {
                b.HasOne("Host.Entities.AspNetRole")
                    .WithMany("Claims")
                    .HasForeignKey("RoleId")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserClaim<string>", b =>
            {
                b.HasOne("Host.Entities.ApplicationUser")
                    .WithMany("Claims")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserLogin<string>", b =>
            {
                b.HasOne("Host.Entities.ApplicationUser")
                    .WithMany("Logins")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityUserRole<string>", b =>
            {
                b.HasOne("Host.Entities.AspNetRole")
                    .WithMany("Users")
                    .HasForeignKey("RoleId")
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne("Host.Entities.ApplicationUser")
                    .WithMany("Roles")
                    .HasForeignKey("UserId")
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
