using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class CreateSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApiResources",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    DisplayName = table.Column<string>(maxLength: 200, nullable: true),
                    Enabled = table.Column<bool>(nullable: true),
                    Name = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 250, nullable: false),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    CreatedBy = table.Column<string>(maxLength: 255, nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Name = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(maxLength: 256, nullable: false),
                    Ord = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    AbsoluteRefreshTokenLifetime = table.Column<int>(nullable: true),
                    AccessTokenLifetime = table.Column<int>(nullable: true),
                    AccessTokenType = table.Column<int>(nullable: true),
                    AllowAccessTokensViaBrowser = table.Column<bool>(nullable: true),
                    AllowOfflineAccess = table.Column<bool>(nullable: true),
                    AllowPlainTextPkce = table.Column<bool>(nullable: true),
                    AllowRememberConsent = table.Column<bool>(nullable: true),
                    AlwaysIncludeUCInIdToken = table.Column<bool>(nullable: true),
                    AlwaysSendClientClaims = table.Column<bool>(nullable: true),
                    AuthorizationCodeLifetime = table.Column<int>(nullable: true),
                    ClientId = table.Column<string>(maxLength: 200, nullable: false),
                    ClientName = table.Column<string>(maxLength: 200, nullable: true),
                    ClientUri = table.Column<string>(maxLength: 2000, nullable: true),
                    EnableLocalLogin = table.Column<bool>(nullable: true),
                    Enabled = table.Column<bool>(nullable: true),
                    IdentityTokenLifetime = table.Column<int>(nullable: true),
                    IncludeJwtId = table.Column<bool>(nullable: true),
                    LogoUri = table.Column<string>(nullable: true),
                    LogoutSessionRequired = table.Column<bool>(nullable: true),
                    LogoutUri = table.Column<string>(nullable: true),
                    PrefixClientClaims = table.Column<bool>(nullable: true),
                    ProtocolType = table.Column<string>(maxLength: 200, nullable: false),
                    RefreshTokenExpiration = table.Column<int>(nullable: true),
                    RefreshTokenUsage = table.Column<int>(nullable: true),
                    RequireClientSecret = table.Column<bool>(nullable: true),
                    RequireConsent = table.Column<bool>(nullable: true),
                    RequirePkce = table.Column<bool>(nullable: true),
                    SlidingRefreshTokenLifetime = table.Column<int>(nullable: true),
                    UpdateAccessTCOnRefresh = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESAccessLogs",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false),
                    AccessDate = table.Column<DateTime>(nullable: false),
                    Action = table.Column<string>(type: "varchar(50)", nullable: false),
                    Application = table.Column<string>(maxLength: 255, nullable: false),
                    Description = table.Column<string>(maxLength: 450, nullable: true),
                    IPAddress = table.Column<string>(type: "varchar(50)", nullable: true),
                    Resource = table.Column<string>(maxLength: 255, nullable: false),
                    UserId = table.Column<string>(maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESAccessLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESActions",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 50, nullable: false),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    Seq = table.Column<int>(nullable: false),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESActions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESApiClients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    Name = table.Column<string>(maxLength: 255, nullable: true),
                    Scopes = table.Column<string>(maxLength: 255, nullable: true),
                    Secret = table.Column<string>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESApiClients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESApplications",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    AuthenticationScheme = table.Column<string>(maxLength: 255, nullable: true),
                    Authority = table.Column<string>(maxLength: 255, nullable: true),
                    ClientId = table.Column<string>(maxLength: 255, nullable: true),
                    ClientSecret = table.Column<string>(maxLength: 255, nullable: true),
                    Code = table.Column<string>(maxLength: 255, nullable: false),
                    Description = table.Column<string>(nullable: true),
                    NameClaimType = table.Column<string>(maxLength: 255, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    RequireHttps = table.Column<bool>(nullable: true),
                    ResponseType = table.Column<string>(maxLength: 255, nullable: true),
                    RoleClaimType = table.Column<string>(maxLength: 255, nullable: true),
                    Scope = table.Column<string>(maxLength: 255, nullable: true),
                    Status = table.Column<int>(nullable: false),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESClientConnects",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: true),
                    ConnectDate = table.Column<DateTime>(nullable: true),
                    DisconnectDate = table.Column<DateTime>(nullable: true),
                    IPAddress = table.Column<string>(type: "varchar(50)", nullable: true),
                    UserId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESClientConnects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESEndpoints",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    IPAddress = table.Column<string>(type: "varchar(50)", nullable: false),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESEndpoints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESGroupParameters",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Title = table.Column<string>(maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESGroupParameters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESGroupResources",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 50, nullable: false),
                    Seq = table.Column<int>(nullable: false),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESGroupResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESGroupUsers",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    Description = table.Column<string>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESGroupUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESOAuthClients",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    AccessTokenLifetime = table.Column<int>(nullable: true),
                    AllowedScopes = table.Column<string>(maxLength: 255, nullable: true),
                    ClientId = table.Column<string>(maxLength: 255, nullable: false),
                    ClientSecret = table.Column<string>(maxLength: 255, nullable: false),
                    Description = table.Column<string>(maxLength: 255, nullable: true),
                    GrantTypes = table.Column<string>(maxLength: 255, nullable: false),
                    Logo = table.Column<string>(maxLength: 255, nullable: true),
                    PostLogoutRedirectUris = table.Column<string>(maxLength: 255, nullable: true),
                    RedirectUris = table.Column<string>(maxLength: 255, nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESOAuthClients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ESOrganizations",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 255, nullable: false),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESOrganizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESOrganizations_ESOrganizations",
                        column: x => x.ParentId,
                        principalTable: "ESOrganizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ESPolicies",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(50)", nullable: false),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false),
                    Value = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESPolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IdentityResources",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    DisplayName = table.Column<string>(maxLength: 200, nullable: true),
                    Emphasize = table.Column<bool>(nullable: true),
                    Enabled = table.Column<bool>(nullable: true),
                    Name = table.Column<string>(maxLength: 200, nullable: false),
                    Required = table.Column<bool>(nullable: true),
                    ShowInDiscoveryDocument = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdentityResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    LoginProvider = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: false),
                    Value = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                });

            migrationBuilder.CreateTable(
                name: "ApiClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ApiResourceId = table.Column<int>(nullable: true),
                    Type = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiClaims_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApiScopes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ApiResourceId = table.Column<int>(nullable: true),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    DisplayName = table.Column<string>(maxLength: 200, nullable: true),
                    Emphasize = table.Column<bool>(nullable: true),
                    Name = table.Column<string>(maxLength: 200, nullable: false),
                    Required = table.Column<bool>(nullable: true),
                    ShowInDiscoveryDocument = table.Column<bool>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiScopes_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApiSecrets",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ApiResourceId = table.Column<int>(nullable: true),
                    Description = table.Column<string>(maxLength: 1000, nullable: true),
                    Expiration = table.Column<DateTime>(nullable: true),
                    Type = table.Column<string>(maxLength: 250, nullable: true),
                    Value = table.Column<string>(maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiSecrets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiSecrets_ApiResources_ApiResourceId",
                        column: x => x.ApiResourceId,
                        principalTable: "ApiResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    Type = table.Column<string>(maxLength: 250, nullable: false),
                    Value = table.Column<string>(maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientClaims_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientCorsOrigins",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    Origin = table.Column<string>(maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientCorsOrigins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientCorsOrigins_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientGrantTypes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    GrantType = table.Column<string>(maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientGrantTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientGrantTypes_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientIdPRestrictions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    Provider = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientIdPRestrictions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientIdPRestrictions_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientPostLogoutRedirectUris",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    PostLogoutRedirectUri = table.Column<string>(maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientPostLogoutRedirectUris", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientPostLogoutRedirectUris_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientRedirectUris",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    RedirectUri = table.Column<string>(maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientRedirectUris", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientRedirectUris_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientScopes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    Scope = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientScopes_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientSecrets",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClientId = table.Column<int>(nullable: false),
                    Description = table.Column<string>(maxLength: 2000, nullable: true),
                    Expiration = table.Column<DateTime>(nullable: true),
                    Type = table.Column<string>(maxLength: 250, nullable: true),
                    Value = table.Column<string>(maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientSecrets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientSecrets_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESRoleApps",
                columns: table => new
                {
                    RoleId = table.Column<string>(maxLength: 250, nullable: false),
                    ApplicationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESRoleAPps", x => new { x.RoleId, x.ApplicationId });
                    table.ForeignKey(
                        name: "FK_ESRoleAPps_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESRoleAPps_AspNetRoles",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESEndpointApps",
                columns: table => new
                {
                    EndpointId = table.Column<int>(nullable: false),
                    ApplicationId = table.Column<int>(nullable: false),
                    Allow = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESEndpointApps", x => new { x.EndpointId, x.ApplicationId });
                    table.ForeignKey(
                        name: "FK_ESEndpointApps_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESEndpointApps_ESEndpoints",
                        column: x => x.EndpointId,
                        principalTable: "ESEndpoints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESParameters",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 525, nullable: false),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    GroupId = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 250, nullable: false),
                    Value = table.Column<string>(maxLength: 525, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESParameters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESParameters_ESGroupParameters",
                        column: x => x.GroupId,
                        principalTable: "ESGroupParameters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ESParameters_ESParameters",
                        column: x => x.ParentId,
                        principalTable: "ESParameters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ESAppGResources",
                columns: table => new
                {
                    ApplicationId = table.Column<int>(nullable: false),
                    GroupResourceId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESAppResources", x => new { x.ApplicationId, x.GroupResourceId });
                    table.ForeignKey(
                        name: "FK_ESAppResources_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESAppGResources_ESResources",
                        column: x => x.GroupResourceId,
                        principalTable: "ESGroupResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESResources",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 255, nullable: false),
                    GroupResourceId = table.Column<string>(maxLength: 50, nullable: false),
                    Ord = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESResources_ESResTypes",
                        column: x => x.GroupResourceId,
                        principalTable: "ESGroupResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ESResources_ESResources",
                        column: x => x.ParentId,
                        principalTable: "ESResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ESGroupApps",
                columns: table => new
                {
                    GroupId = table.Column<int>(nullable: false),
                    ApplicationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESGroupApps", x => new { x.GroupId, x.ApplicationId });
                    table.ForeignKey(
                        name: "FK_ESGroupApps_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ESGroupApps_ESGroupUsers",
                        column: x => x.GroupId,
                        principalTable: "ESGroupUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(maxLength: 250, nullable: false),
                    AccessFailedCount = table.Column<int>(nullable: false),
                    ConcurrencyStamp = table.Column<string>(nullable: true),
                    CreatedBy = table.Column<string>(maxLength: 255, nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    Email = table.Column<string>(maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(nullable: false),
                    FamilyName = table.Column<string>(maxLength: 255, nullable: true),
                    GivenName = table.Column<string>(maxLength: 255, nullable: true),
                    LockoutEnabled = table.Column<bool>(nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
                    MiddleName = table.Column<string>(maxLength: 255, nullable: true),
                    NormalizedEmail = table.Column<string>(maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(maxLength: 256, nullable: false),
                    OfficeNumber = table.Column<int>(nullable: true),
                    OrgId = table.Column<int>(nullable: true),
                    PasswordHash = table.Column<string>(nullable: true),
                    PhoneNumber = table.Column<string>(nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(nullable: false),
                    Picture = table.Column<string>(maxLength: 255, nullable: true),
                    SecurityStamp = table.Column<string>(nullable: true),
                    TwoFactorEnabled = table.Column<bool>(nullable: false),
                    UserName = table.Column<string>(maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_ESOrganizations_OrgId",
                        column: x => x.OrgId,
                        principalTable: "ESOrganizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ESOrgApps",
                columns: table => new
                {
                    OrgId = table.Column<int>(nullable: false),
                    ApplicationId = table.Column<int>(nullable: false),
                    Allow = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESOrgApps", x => new { x.OrgId, x.ApplicationId });
                    table.ForeignKey(
                        name: "FK_ESOrgApps_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESOrgApps_ESOrganizations",
                        column: x => x.OrgId,
                        principalTable: "ESOrganizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IdentityClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    IdentityResourceId = table.Column<int>(nullable: true),
                    Type = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IdentityClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IdentityClaims_IdentityResources_IdentityResourceId",
                        column: x => x.IdentityResourceId,
                        principalTable: "IdentityResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApiScopeClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ApiScopeId = table.Column<int>(nullable: false),
                    Type = table.Column<string>(maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiScopeClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiScopeClaims_ApiScopes_ApiScopeId",
                        column: x => x.ApiScopeId,
                        principalTable: "ApiScopes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESPrivileges",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ActionId = table.Column<string>(maxLength: 50, nullable: false),
                    ResourceId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESPrivileges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESPrivileges_ESActions",
                        column: x => x.ActionId,
                        principalTable: "ESActions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESPrivileges_ESResources",
                        column: x => x.ResourceId,
                        principalTable: "ESResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESResAttributes",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Key = table.Column<string>(maxLength: 50, nullable: false),
                    ResourceId = table.Column<int>(nullable: false),
                    Value = table.Column<string>(maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESResAttributes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESResAttributes_ESResources",
                        column: x => x.ResourceId,
                        principalTable: "ESResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESExtendAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Account = table.Column<string>(maxLength: 255, nullable: false),
                    Type = table.Column<string>(type: "varchar(50)", nullable: false),
                    UserId = table.Column<string>(maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESExtendAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ESExtendAccounts_AspNetUsers",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESUserApps",
                columns: table => new
                {
                    UserId = table.Column<string>(maxLength: 250, nullable: false),
                    ApplicationId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESUserApps", x => new { x.UserId, x.ApplicationId });
                    table.ForeignKey(
                        name: "FK_ESUserApps_ESApplications",
                        column: x => x.ApplicationId,
                        principalTable: "ESApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESUserApps_AspNetUsers",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESUserInGroups",
                columns: table => new
                {
                    GroupUserId = table.Column<int>(nullable: false),
                    UserId = table.Column<string>(maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESUserInGroups", x => new { x.GroupUserId, x.UserId });
                    table.ForeignKey(
                        name: "FK_ESUserInGroups_ESGroupUsers",
                        column: x => x.GroupUserId,
                        principalTable: "ESGroupUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ESUserInGroups_AspNetUsers",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    ClaimType = table.Column<string>(nullable: true),
                    ClaimValue = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(nullable: false),
                    ProviderKey = table.Column<string>(nullable: false),
                    ProviderDisplayName = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    RoleId = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESGroupUserPrivileges",
                columns: table => new
                {
                    GroupUserId = table.Column<int>(nullable: false),
                    PrivilegeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESGroupUserPrivileges", x => new { x.GroupUserId, x.PrivilegeId });
                    table.ForeignKey(
                        name: "FK_ESGroupUserPrivileges_ESGroupUsers",
                        column: x => x.GroupUserId,
                        principalTable: "ESGroupUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESGroupUserPrivileges_ESPrivileges",
                        column: x => x.PrivilegeId,
                        principalTable: "ESPrivileges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESOrgPrivileges",
                columns: table => new
                {
                    OrgId = table.Column<int>(nullable: false),
                    PrivilegeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESOrgPrivileges", x => new { x.OrgId, x.PrivilegeId });
                    table.ForeignKey(
                        name: "FK_ESOrgPrivileges_ESOrganizations",
                        column: x => x.OrgId,
                        principalTable: "ESOrganizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESOrgPrivileges_ESPrivileges",
                        column: x => x.PrivilegeId,
                        principalTable: "ESPrivileges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESRolePrivileges",
                columns: table => new
                {
                    RoleId = table.Column<string>(maxLength: 250, nullable: false),
                    PrivilegeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESRolePrivileges", x => new { x.RoleId, x.PrivilegeId });
                    table.ForeignKey(
                        name: "FK_ESRolePrivileges_ESPrivileges",
                        column: x => x.PrivilegeId,
                        principalTable: "ESPrivileges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESRolePrivileges_AspNetRoles",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ESUserPrivileges",
                columns: table => new
                {
                    UserId = table.Column<string>(maxLength: 250, nullable: false),
                    PrivilegeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ESUserPrivileges", x => new { x.UserId, x.PrivilegeId });
                    table.ForeignKey(
                        name: "FK_ESUserPrivileges_ESPrivileges",
                        column: x => x.PrivilegeId,
                        principalTable: "ESPrivileges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ESUserPrivileges_AspNetUsers",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApiClaims_ApiResourceId",
                table: "ApiClaims",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiResources_Name",
                table: "ApiResources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiScopes_ApiResourceId",
                table: "ApiScopes",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiScopes_Name",
                table: "ApiScopes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiScopeClaims_ApiScopeId",
                table: "ApiScopeClaims",
                column: "ApiScopeId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiSecrets_ApiResourceId",
                table: "ApiSecrets",
                column: "ApiResourceId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_OrgId",
                table: "AspNetUsers",
                column: "OrgId");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_ClientId",
                table: "Clients",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientClaims_ClientId",
                table: "ClientClaims",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientCorsOrigins_ClientId",
                table: "ClientCorsOrigins",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientGrantTypes_ClientId",
                table: "ClientGrantTypes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientIdPRestrictions_ClientId",
                table: "ClientIdPRestrictions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientPostLogoutRedirectUris_ClientId",
                table: "ClientPostLogoutRedirectUris",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientRedirectUris_ClientId",
                table: "ClientRedirectUris",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientScopes_ClientId",
                table: "ClientScopes",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientSecrets_ClientId",
                table: "ClientSecrets",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_ESActions_Id",
                table: "ESActions",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ESAppGResources_GroupResourceId",
                table: "ESAppGResources",
                column: "GroupResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ESApplications",
                table: "ESApplications",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ESEndpointApps_ApplicationId",
                table: "ESEndpointApps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ESExtendAccounts_UserId",
                table: "ESExtendAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ESGroupApps_ApplicationId",
                table: "ESGroupApps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ESGroupResources_Id",
                table: "ESGroupResources",
                column: "Id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ESGroupUserPrivileges_PrivilegeId",
                table: "ESGroupUserPrivileges",
                column: "PrivilegeId");

            migrationBuilder.CreateIndex(
                name: "IX_ESOAuthClients",
                table: "ESOAuthClients",
                column: "ClientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ESOrganizations_ParentId",
                table: "ESOrganizations",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_ESOrgApps_ApplicationId",
                table: "ESOrgApps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ESOrgPrivileges_PrivilegeId",
                table: "ESOrgPrivileges",
                column: "PrivilegeId");

            migrationBuilder.CreateIndex(
                name: "IX_ESParameters_GroupId",
                table: "ESParameters",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ESParameters_ParentId",
                table: "ESParameters",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_ESPrivileges_ActionId",
                table: "ESPrivileges",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_ESPrivileges_ResourceId",
                table: "ESPrivileges",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ESResAttributes_ResourceId",
                table: "ESResAttributes",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ESResources_GroupResourceId",
                table: "ESResources",
                column: "GroupResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ESResources_ParentId",
                table: "ESResources",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_ESRoleApps_ApplicationId",
                table: "ESRoleApps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ESRolePrivileges_PrivilegeId",
                table: "ESRolePrivileges",
                column: "PrivilegeId");

            migrationBuilder.CreateIndex(
                name: "IX_ESUserApps_ApplicationId",
                table: "ESUserApps",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ESUserInGroups_UserId",
                table: "ESUserInGroups",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ESUserPrivileges_PrivilegeId",
                table: "ESUserPrivileges",
                column: "PrivilegeId");

            migrationBuilder.CreateIndex(
                name: "IX_IdentityClaims_IdentityResourceId",
                table: "IdentityClaims",
                column: "IdentityResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_IdentityResources_Name",
                table: "IdentityResources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiClaims");

            migrationBuilder.DropTable(
                name: "ApiScopeClaims");

            migrationBuilder.DropTable(
                name: "ApiSecrets");

            migrationBuilder.DropTable(
                name: "ClientClaims");

            migrationBuilder.DropTable(
                name: "ClientCorsOrigins");

            migrationBuilder.DropTable(
                name: "ClientGrantTypes");

            migrationBuilder.DropTable(
                name: "ClientIdPRestrictions");

            migrationBuilder.DropTable(
                name: "ClientPostLogoutRedirectUris");

            migrationBuilder.DropTable(
                name: "ClientRedirectUris");

            migrationBuilder.DropTable(
                name: "ClientScopes");

            migrationBuilder.DropTable(
                name: "ClientSecrets");

            migrationBuilder.DropTable(
                name: "ESAccessLogs");

            migrationBuilder.DropTable(
                name: "ESApiClients");

            migrationBuilder.DropTable(
                name: "ESAppGResources");

            migrationBuilder.DropTable(
                name: "ESClientConnects");

            migrationBuilder.DropTable(
                name: "ESEndpointApps");

            migrationBuilder.DropTable(
                name: "ESExtendAccounts");

            migrationBuilder.DropTable(
                name: "ESGroupApps");

            migrationBuilder.DropTable(
                name: "ESGroupUserPrivileges");

            migrationBuilder.DropTable(
                name: "ESOAuthClients");

            migrationBuilder.DropTable(
                name: "ESOrgApps");

            migrationBuilder.DropTable(
                name: "ESOrgPrivileges");

            migrationBuilder.DropTable(
                name: "ESParameters");

            migrationBuilder.DropTable(
                name: "ESPolicies");

            migrationBuilder.DropTable(
                name: "ESResAttributes");

            migrationBuilder.DropTable(
                name: "ESRoleApps");

            migrationBuilder.DropTable(
                name: "ESRolePrivileges");

            migrationBuilder.DropTable(
                name: "ESUserApps");

            migrationBuilder.DropTable(
                name: "ESUserInGroups");

            migrationBuilder.DropTable(
                name: "ESUserPrivileges");

            migrationBuilder.DropTable(
                name: "IdentityClaims");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "ApiScopes");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "ESEndpoints");

            migrationBuilder.DropTable(
                name: "ESGroupParameters");

            migrationBuilder.DropTable(
                name: "ESApplications");

            migrationBuilder.DropTable(
                name: "ESGroupUsers");

            migrationBuilder.DropTable(
                name: "ESPrivileges");

            migrationBuilder.DropTable(
                name: "IdentityResources");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "ApiResources");

            migrationBuilder.DropTable(
                name: "ESActions");

            migrationBuilder.DropTable(
                name: "ESResources");

            migrationBuilder.DropTable(
                name: "ESOrganizations");

            migrationBuilder.DropTable(
                name: "ESGroupResources");
        }
    }
}
