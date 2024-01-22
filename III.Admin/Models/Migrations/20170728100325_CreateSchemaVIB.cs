using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace EIM.Models.Migrations
{
    public partial class CreateSchemaVIB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VIBApplication",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    AuthenticationScheme = table.Column<string>(maxLength: 255, nullable: true),
                    Authority = table.Column<string>(maxLength: 255, nullable: true),
                    ClientId = table.Column<string>(maxLength: 255, nullable: true),
                    ClientSecret = table.Column<string>(maxLength: 255, nullable: true),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    NameClaimType = table.Column<string>(maxLength: 255, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    RequireHttps = table.Column<bool>(nullable: true),
                    ResponseType = table.Column<string>(maxLength: 255, nullable: true),
                    RoleClaimType = table.Column<string>(maxLength: 255, nullable: true),
                    Scope = table.Column<string>(maxLength: 255, nullable: true),
                    Status = table.Column<int>(nullable: false),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBApplication", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VIBFunction",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBFunction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBFunction_VIBFunction_ParentId",
                        column: x => x.ParentId,
                        principalTable: "VIBFunction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIBGroupResource",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBGroupResource", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VIBGroupUser",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    CreatedDate = table.Column<DateTime>(nullable: true),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBGroupUser", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VIBOrganization",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Ord = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBOrganization", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBOrganization_VIBOrganization_ParentId",
                        column: x => x.ParentId,
                        principalTable: "VIBOrganization",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIBAppGroupResource",
                columns: table => new
                {
                    ApplicationId = table.Column<int>(nullable: false),
                    GroupResourceId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBAppGroupResource", x => new { x.ApplicationId, x.GroupResourceId });
                    table.ForeignKey(
                        name: "FK_VIBAppGroupResource_VIBApplication_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "VIBApplication",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBAppGroupResource_VIBGroupResource_GroupResourceId",
                        column: x => x.GroupResourceId,
                        principalTable: "VIBGroupResource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VIBResource",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 20, nullable: true),
                    Description = table.Column<string>(maxLength: 2000, nullable: true),
                    GroupResourceId = table.Column<int>(nullable: false),
                    Ord = table.Column<int>(nullable: true),
                    ParentId = table.Column<int>(nullable: true),
                    Path = table.Column<string>(maxLength: 255, nullable: true),
                    Title = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBResource", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBResource_VIBGroupResource_GroupResourceId",
                        column: x => x.GroupResourceId,
                        principalTable: "VIBGroupResource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBResource_VIBResource_ParentId",
                        column: x => x.ParentId,
                        principalTable: "VIBResource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIBUserInGroup",
                columns: table => new
                {
                    UserId = table.Column<string>(nullable: false),
                    GroupUserId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBUserInGroup", x => new { x.UserId, x.GroupUserId });
                    table.ForeignKey(
                        name: "FK_VIBUserInGroup_VIBGroupUser_GroupUserId",
                        column: x => x.GroupUserId,
                        principalTable: "VIBGroupUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBUserInGroup_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VIBPrivilege",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false),
                    FunctionId = table.Column<int>(nullable: false),
                    ResourceId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBPrivilege", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VIBPrivilege_VIBFunction_FunctionId",
                        column: x => x.FunctionId,
                        principalTable: "VIBFunction",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBPrivilege_VIBResource_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "VIBResource",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VIBGroupUserPrivilege",
                columns: table => new
                {
                    GroupUserId = table.Column<int>(nullable: false),
                    PrivilegeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIBGroupUserPrivilege", x => new { x.GroupUserId, x.PrivilegeId });
                    table.ForeignKey(
                        name: "FK_VIBGroupUserPrivilege_VIBGroupUser_GroupUserId",
                        column: x => x.GroupUserId,
                        principalTable: "VIBGroupUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VIBGroupUserPrivilege_VIBPrivilege_PrivilegeId",
                        column: x => x.PrivilegeId,
                        principalTable: "VIBPrivilege",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VIBAppGroupResource_GroupResourceId",
                table: "VIBAppGroupResource",
                column: "GroupResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBFunction_ParentId",
                table: "VIBFunction",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBGroupUserPrivilege_PrivilegeId",
                table: "VIBGroupUserPrivilege",
                column: "PrivilegeId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBOrganization_ParentId",
                table: "VIBOrganization",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPrivilege_FunctionId",
                table: "VIBPrivilege",
                column: "FunctionId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBPrivilege_ResourceId",
                table: "VIBPrivilege",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBResource_GroupResourceId",
                table: "VIBResource",
                column: "GroupResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBResource_ParentId",
                table: "VIBResource",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_VIBUserInGroup_GroupUserId",
                table: "VIBUserInGroup",
                column: "GroupUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIBAppGroupResource");

            migrationBuilder.DropTable(
                name: "VIBGroupUserPrivilege");

            migrationBuilder.DropTable(
                name: "VIBOrganization");

            migrationBuilder.DropTable(
                name: "VIBUserInGroup");

            migrationBuilder.DropTable(
                name: "VIBApplication");

            migrationBuilder.DropTable(
                name: "VIBPrivilege");

            migrationBuilder.DropTable(
                name: "VIBGroupUser");

            migrationBuilder.DropTable(
                name: "VIBFunction");

            migrationBuilder.DropTable(
                name: "VIBResource");

            migrationBuilder.DropTable(
                name: "VIBGroupResource");
        }
    }
}
