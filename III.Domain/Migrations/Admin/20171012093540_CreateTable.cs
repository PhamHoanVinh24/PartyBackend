using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace III.Domain.Migrations.Admin1
{
    public partial class CreateTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ASP_NET_ROLES",
                columns: table => new
                {
                    ID = table.Column<string>(maxLength: 50, nullable: false),
                    CONCURRENCY_STAMP = table.Column<string>(maxLength: 255, nullable: true),
                    NAME = table.Column<string>(maxLength: 256, nullable: true),
                    NORMALIZED_NAME = table.Column<string>(maxLength: 256, nullable: true),
                    CODE = table.Column<string>(maxLength: 50, nullable: true),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 2000, nullable: true),
                    ORD = table.Column<int>(nullable: true),
                    STATUS = table.Column<bool>(nullable: false),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_ROLES", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_ACCESS_LOG",
                columns: table => new
                {
                    ACCESS_LOG_ID = table.Column<int>(nullable: false),
                    ACCESS_LOG_CODE = table.Column<string>(maxLength: 255, nullable: true),
                    ACTION = table.Column<string>(maxLength: 50, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 450, nullable: true),
                    USER_ID = table.Column<string>(maxLength: 250, nullable: true),
                    ACCESS_LOG_APPLICATION = table.Column<string>(maxLength: 255, nullable: true),
                    ACCESS_DATE = table.Column<DateTime>(nullable: true),
                    IP_ADDRESS = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_ACCESS_LOG", x => x.ACCESS_LOG_ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_ACTION_LOG",
                columns: table => new
                {
                    ACTION_LOG_ID = table.Column<int>(nullable: false),
                    LOG_LEVEL = table.Column<string>(maxLength: 50, nullable: true),
                    ACTION_LOG_APPLICATION = table.Column<string>(maxLength: 500, nullable: true),
                    ACTION_LOG_HOST = table.Column<string>(maxLength: 100, nullable: true),
                    ACTION_LOG_PATH = table.Column<string>(maxLength: 300, nullable: true),
                    RESOURCE_NAME = table.Column<string>(maxLength: 255, nullable: true),
                    MESSAGE = table.Column<string>(maxLength: 2000, nullable: true),
                    BROWSER = table.Column<string>(maxLength: 300, nullable: true),
                    IP_ADDRESS = table.Column<string>(maxLength: 20, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 255, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    TABLE_MODIFIED = table.Column<string>(maxLength: 255, nullable: true),
                    DATA_NEW = table.Column<string>(nullable: true),
                    DATA_OLD = table.Column<string>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_ACTION_LOG", x => x.ACTION_LOG_ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_ACTION_LOG_HIST",
                columns: table => new
                {
                    ACTION_LOG_ID = table.Column<int>(nullable: false),
                    LOG_LEVEL = table.Column<string>(maxLength: 50, nullable: true),
                    ACTION_LOG_APPLICATION = table.Column<string>(maxLength: 500, nullable: true),
                    ACTION_LOG_HOST = table.Column<string>(maxLength: 100, nullable: true),
                    ACTION_LOG_PATH = table.Column<string>(maxLength: 300, nullable: true),
                    RESOURCE_NAME = table.Column<string>(maxLength: 255, nullable: true),
                    MESSAGE = table.Column<string>(maxLength: 2000, nullable: true),
                    BROWSER = table.Column<string>(maxLength: 300, nullable: true),
                    IP_ADDRESS = table.Column<string>(maxLength: 20, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 255, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    TABLE_MODIFIED = table.Column<string>(maxLength: 255, nullable: true),
                    DATA_NEW = table.Column<string>(nullable: true),
                    DATA_OLD = table.Column<string>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_ACTION_LOG_HIST", x => x.ACTION_LOG_ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_APPLICATION",
                columns: table => new
                {
                    APPLICATION_ID = table.Column<int>(nullable: false),
                    APPLICATION_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    DESCRIPTION = table.Column<string>(maxLength: 500, nullable: true),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    APP_URL = table.Column<string>(maxLength: 300, nullable: true),
                    ICON = table.Column<string>(maxLength: 300, nullable: true),
                    STATUS = table.Column<int>(nullable: false),
                    ORD = table.Column<int>(nullable: true),
                    AUTHENTICATION_SCHEME = table.Column<string>(maxLength: 255, nullable: true),
                    AUTHORITY = table.Column<string>(maxLength: 255, nullable: true),
                    CLIENT_ID = table.Column<string>(maxLength: 255, nullable: true),
                    CLIENT_SECRET = table.Column<string>(maxLength: 255, nullable: true),
                    NAME_CLAIM_TYPE = table.Column<string>(maxLength: 255, nullable: true),
                    REQUIRE_HTTPS = table.Column<bool>(nullable: true),
                    RESPONSE_TYPE = table.Column<string>(maxLength: 255, nullable: true),
                    ROLE_CLAIM_TYPE = table.Column<string>(maxLength: 255, nullable: true),
                    SCOPE = table.Column<string>(maxLength: 255, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_APPLICATION", x => x.APPLICATION_CODE);
                });

            migrationBuilder.CreateTable(
                name: "VIB_DIVISION",
                columns: table => new
                {
                    DIVISION = table.Column<string>(maxLength: 255, nullable: false),
                    DIVISION_DESC = table.Column<string>(maxLength: 255, nullable: true),
                    UPDATE_TIME = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_DIVISION", x => x.DIVISION);
                });

            migrationBuilder.CreateTable(
                name: "VIB_JOB_LOG",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false),
                    SYM_RUN_DATE = table.Column<DateTime>(nullable: false),
                    FUNCTION_CODE = table.Column<string>(maxLength: 100, nullable: false),
                    PACKAGE_NAME = table.Column<string>(maxLength: 100, nullable: true),
                    PROCEDURE_NAME = table.Column<string>(maxLength: 100, nullable: true),
                    TABLE_NAME = table.Column<string>(maxLength: 100, nullable: true),
                    TOTAL_RECORD = table.Column<int>(nullable: false),
                    STATUS = table.Column<string>(maxLength: 3, nullable: true),
                    RUN_TIME = table.Column<DateTime>(maxLength: 255, nullable: false),
                    ERROR_DESC = table.Column<string>(maxLength: 2000, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_JOB_LOG", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_FM_ACCT_EXEC",
                columns: table => new
                {
                    ACCT_EXEC = table.Column<string>(maxLength: 3, nullable: false),
                    ACCT_EXEC_NAME = table.Column<string>(maxLength: 50, nullable: true),
                    MANAGER = table.Column<string>(maxLength: 3, nullable: true),
                    PROFIT_SEGMENT = table.Column<string>(maxLength: 12, nullable: true),
                    STAFF_CODE = table.Column<string>(maxLength: 6, nullable: true),
                    COLLAT_MGR_IND = table.Column<string>(maxLength: 1, nullable: true),
                    CREATE_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_FM_ACCT_EXEC", x => x.ACCT_EXEC);
                });

            migrationBuilder.CreateTable(
                name: "VIB_FUNCTION",
                columns: table => new
                {
                    FUNCTION_ID = table.Column<int>(nullable: false),
                    FUNCTION_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 500, nullable: true),
                    ORD = table.Column<int>(nullable: true),
                    PARENT_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_FUNCTION", x => x.FUNCTION_CODE);
                    table.ForeignKey(
                        name: "FK_VIB_FUNCTION_VIB_FUNCTION_PARENT_CODE",
                        column: x => x.PARENT_CODE,
                        principalTable: "VIB_FUNCTION",
                        principalColumn: "FUNCTION_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_GROUP_USER",
                columns: table => new
                {
                    GROUP_USER_ID = table.Column<int>(nullable: false),
                    GROUP_USER_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 500, nullable: true),
                    PARENT_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_GROUP_USER", x => x.GROUP_USER_CODE);
                    table.ForeignKey(
                        name: "FK_VIB_GROUP_USER_VIB_GROUP_USER_PARENT_CODE",
                        column: x => x.PARENT_CODE,
                        principalTable: "VIB_GROUP_USER",
                        principalColumn: "GROUP_USER_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_LANGUAGE",
                columns: table => new
                {
                    LANGUAGE_ID = table.Column<int>(nullable: false),
                    CULTURE = table.Column<string>(maxLength: 10, nullable: true),
                    DISPLAY_NAME = table.Column<string>(maxLength: 256, nullable: true),
                    ICON = table.Column<string>(maxLength: 128, nullable: true),
                    ORDERING = table.Column<int>(nullable: false),
                    IS_ENABLED = table.Column<bool>(nullable: false),
                    IS_DEFAULT = table.Column<bool>(nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                    DELETED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    DELETED_DATE = table.Column<DateTime>(nullable: true),
                    IS_DELETED = table.Column<bool>(nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_LANGUAGE", x => x.LANGUAGE_ID);
                });

            migrationBuilder.CreateTable(
                name: "VIB_ORGANIZATION",
                columns: table => new
                {
                    ORG_ID = table.Column<int>(nullable: false),
                    ORG_ADDON_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    ORG_GROUP = table.Column<int>(nullable: true),
                    ORG_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    ORG_NAME = table.Column<string>(maxLength: 500, nullable: true),
                    ORG_ORD = table.Column<int>(nullable: true),
                    ORG_PARENT_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    ORG_UPDATE_TIME = table.Column<string>(maxLength: 50, nullable: true),
                    COMPANY = table.Column<string>(maxLength: 255, nullable: true),
                    COUNTRY = table.Column<string>(maxLength: 255, nullable: true),
                    STATE = table.Column<string>(maxLength: 255, nullable: true),
                    HIERARCHY_CODE = table.Column<string>(maxLength: 255, nullable: true),
                    DIVISION = table.Column<string>(maxLength: 255, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_ORGANIZATION", x => x.ORG_ADDON_CODE);
                    table.ForeignKey(
                        name: "FK_VIB_ORGANIZATION_VIB_ORGANIZATION_ORG_PARENT_CODE",
                        column: x => x.ORG_PARENT_CODE,
                        principalTable: "VIB_ORGANIZATION",
                        principalColumn: "ORG_ADDON_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_PARAMETER",
                columns: table => new
                {
                    PARAMETER_ID = table.Column<int>(nullable: false),
                    PARAMETER_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 500, nullable: true),
                    PARENT_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    VALUE = table.Column<string>(maxLength: 50, nullable: true),
                    VALUE2 = table.Column<string>(maxLength: 50, nullable: true),
                    VALUE3 = table.Column<string>(maxLength: 50, nullable: true),
                    VALUE4 = table.Column<string>(maxLength: 50, nullable: true),
                    VALUE5 = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_PARAMETER", x => x.PARAMETER_CODE);
                    table.ForeignKey(
                        name: "FK_VIB_PARAMETER_VIB_PARAMETER_PARENT_CODE",
                        column: x => x.PARENT_CODE,
                        principalTable: "VIB_PARAMETER",
                        principalColumn: "PARAMETER_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_RESOURCE",
                columns: table => new
                {
                    RESOURCE_ID = table.Column<int>(nullable: false),
                    RESOURCE_CODE = table.Column<string>(maxLength: 50, nullable: false),
                    TITLE = table.Column<string>(maxLength: 255, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 2000, nullable: true),
                    API = table.Column<string>(maxLength: 255, nullable: true),
                    PATH = table.Column<string>(maxLength: 255, nullable: true),
                    ORD = table.Column<int>(nullable: true),
                    STATUS = table.Column<bool>(nullable: false),
                    PARENT_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                    STYLE = table.Column<string>(maxLength: 10, nullable: true),
                    SCOPE = table.Column<bool>(nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_RESOURCE", x => x.RESOURCE_CODE);
                    table.ForeignKey(
                        name: "FK_VIB_RESOURCE_VIB_RESOURCE_PARENT_CODE",
                        column: x => x.PARENT_CODE,
                        principalTable: "VIB_RESOURCE",
                        principalColumn: "RESOURCE_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_USER_TOKENS",
                columns: table => new
                {
                    USER_ID = table.Column<string>(maxLength: 50, nullable: false),
                    LOGIN_PROVIDER = table.Column<string>(maxLength: 255, nullable: false),
                    NAME = table.Column<string>(maxLength: 50, nullable: false),
                    VALUE = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_USER_TOKENS", x => new { x.USER_ID, x.LOGIN_PROVIDER, x.NAME });
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_ROLE_CLAIMS",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false),
                    CLAIM_TYPE = table.Column<string>(maxLength: 50, nullable: true),
                    CLAIM_VALUE = table.Column<string>(maxLength: 100, nullable: true),
                    ROLE_ID = table.Column<string>(maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_ROLE_CLAIMS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ASP_NET_ROLE_CLAIMS_ASP_NET_ROLES_ROLE_ID",
                        column: x => x.ROLE_ID,
                        principalTable: "ASP_NET_ROLES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VIB_APP_FUNCTION",
                columns: table => new
                {
                    APP_FUNCTION_ID = table.Column<int>(nullable: false),
                    APPLICATION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    FUNCTION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_APP_FUNCTION", x => x.APP_FUNCTION_ID);
                    table.ForeignKey(
                        name: "FK_VIB_APP_FUNCTION_VIB_APPLICATION_APPLICATION_CODE",
                        column: x => x.APPLICATION_CODE,
                        principalTable: "VIB_APPLICATION",
                        principalColumn: "APPLICATION_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_APP_FUNCTION_VIB_FUNCTION_FUNCTION_CODE",
                        column: x => x.FUNCTION_CODE,
                        principalTable: "VIB_FUNCTION",
                        principalColumn: "FUNCTION_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_LANGUAGE_TEXT",
                columns: table => new
                {
                    LANGUAGE_TEXT_ID = table.Column<int>(nullable: false),
                    LANGUAGE_ID = table.Column<int>(nullable: false),
                    CAPTION = table.Column<string>(maxLength: 500, nullable: true),
                    VALUE = table.Column<string>(nullable: true),
                    GROUP_CAPTION = table.Column<string>(maxLength: 20, nullable: true),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                    DELETED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    DELETED_DATE = table.Column<DateTime>(nullable: true),
                    IS_DELETED = table.Column<bool>(nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_LANGUAGE_TEXT", x => x.LANGUAGE_TEXT_ID);
                    table.ForeignKey(
                        name: "FK_VIB_LANGUAGE_TEXT_VIB_LANGUAGE_LANGUAGE_ID",
                        column: x => x.LANGUAGE_ID,
                        principalTable: "VIB_LANGUAGE",
                        principalColumn: "LANGUAGE_ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_USERS",
                columns: table => new
                {
                    ID = table.Column<string>(maxLength: 50, nullable: false),
                    CONCURRENCY_STAMP = table.Column<string>(maxLength: 50, nullable: true),
                    USER_NAME = table.Column<string>(maxLength: 256, nullable: false),
                    NORMALIZED_USER_NAME = table.Column<string>(maxLength: 256, nullable: false),
                    EMAIL = table.Column<string>(maxLength: 256, nullable: true),
                    NORMALIZED_EMAIL = table.Column<string>(maxLength: 256, nullable: true),
                    EMAIL_CONFIRMED = table.Column<bool>(nullable: false),
                    TWO_FACTOR_ENABLED = table.Column<bool>(nullable: false),
                    ACCESS_FAILED_COUNT = table.Column<decimal>(nullable: false),
                    LOCKOUT_ENABLED = table.Column<bool>(nullable: false),
                    LOCKOUT_END = table.Column<DateTimeOffset>(nullable: true),
                    SECURITY_STAMP = table.Column<string>(maxLength: 50, nullable: true),
                    PASSWORD_HASH = table.Column<string>(maxLength: 2000, nullable: true),
                    PHONE_NUMBER = table.Column<string>(maxLength: 100, nullable: true),
                    PHONE_NUMBER_CONFIRMED = table.Column<bool>(nullable: false),
                    FAMILY_NAME = table.Column<string>(maxLength: 256, nullable: true),
                    MIDDLE_NAME = table.Column<string>(maxLength: 256, nullable: true),
                    GIVEN_NAME = table.Column<string>(maxLength: 256, nullable: true),
                    OFFICE_NUMBER = table.Column<int>(nullable: true),
                    PICTURE = table.Column<string>(maxLength: 256, nullable: true),
                    ACTIVE = table.Column<bool>(nullable: false),
                    EMPLOYEE_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    BRANCH_ID = table.Column<string>(maxLength: 50, nullable: true),
                    ACCOUNT_EXECUTIVE_ID = table.Column<string>(maxLength: 5, nullable: true),
                    ORG_REFERENCE = table.Column<string>(maxLength: 2000, nullable: true),
                    DESCRIPTION = table.Column<string>(maxLength: 2000, nullable: true),
                    NOTE = table.Column<string>(maxLength: 2000, nullable: true),
                    REASON = table.Column<string>(maxLength: 2000, nullable: true),
                    USER_TYPE = table.Column<short>(nullable: false),
                    IS_EXCEEDED = table.Column<bool>(nullable: false),
                    CREATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    CREATED_DATE = table.Column<DateTime>(nullable: true),
                    UPDATED_BY = table.Column<string>(maxLength: 50, nullable: true),
                    UPDATED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_USERS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ASP_NET_USERS_VIB_ORGANIZATION_BRANCH_ID",
                        column: x => x.BRANCH_ID,
                        principalTable: "VIB_ORGANIZATION",
                        principalColumn: "ORG_ADDON_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_PRIVILEGE",
                columns: table => new
                {
                    PRIVILEGE_ID = table.Column<int>(nullable: false),
                    FUNCTION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    RESOURCE_CODE = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_PRIVILEGE", x => x.PRIVILEGE_ID);
                    table.ForeignKey(
                        name: "FK_VIB_PRIVILEGE_VIB_FUNCTION_FUNCTION_CODE",
                        column: x => x.FUNCTION_CODE,
                        principalTable: "VIB_FUNCTION",
                        principalColumn: "FUNCTION_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PRIVILEGE_VIB_RESOURCE_RESOURCE_CODE",
                        column: x => x.RESOURCE_CODE,
                        principalTable: "VIB_RESOURCE",
                        principalColumn: "RESOURCE_CODE",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_PERMISSION",
                columns: table => new
                {
                    PERMISSION_ID = table.Column<int>(nullable: false),
                    APPLICATION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    FUNCTION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    RESOURCE_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    GROUP_USER_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    USER_ID = table.Column<string>(maxLength: 50, nullable: true),
                    ROLE_ID = table.Column<string>(maxLength: 50, nullable: true),
                    EXPIRED_DATE = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_PERMISSION", x => x.PERMISSION_ID);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_VIB_APPLICATION_APPLICATION_CODE",
                        column: x => x.APPLICATION_CODE,
                        principalTable: "VIB_APPLICATION",
                        principalColumn: "APPLICATION_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_VIB_FUNCTION_FUNCTION_CODE",
                        column: x => x.FUNCTION_CODE,
                        principalTable: "VIB_FUNCTION",
                        principalColumn: "FUNCTION_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_VIB_GROUP_USER_GROUP_USER_CODE",
                        column: x => x.GROUP_USER_CODE,
                        principalTable: "VIB_GROUP_USER",
                        principalColumn: "GROUP_USER_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_VIB_RESOURCE_RESOURCE_CODE",
                        column: x => x.RESOURCE_CODE,
                        principalTable: "VIB_RESOURCE",
                        principalColumn: "RESOURCE_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_ASP_NET_ROLES_ROLE_ID",
                        column: x => x.ROLE_ID,
                        principalTable: "ASP_NET_ROLES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_PERMISSION_ASP_NET_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "ASP_NET_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VIB_USER_IN_GROUP",
                columns: table => new
                {
                    USER_IN_GROUP_ID = table.Column<int>(nullable: false),
                    GROUP_USER_CODE = table.Column<string>(maxLength: 50, nullable: true),
                    USER_ID = table.Column<string>(maxLength: 50, nullable: true),
                    ROLE_ID = table.Column<string>(maxLength: 50, nullable: true),
                    GRANT_ALL = table.Column<bool>(nullable: false),
                    IS_MAIN = table.Column<bool>(nullable: false),
                    BRANCH_REFERENCE = table.Column<string>(maxLength: 2000, nullable: true),
                    APPLICATION_CODE = table.Column<string>(maxLength: 50, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VIB_USER_IN_GROUP", x => x.USER_IN_GROUP_ID);
                    table.ForeignKey(
                        name: "FK_VIB_USER_IN_GROUP_VIB_APPLICATION_APPLICATION_CODE",
                        column: x => x.APPLICATION_CODE,
                        principalTable: "VIB_APPLICATION",
                        principalColumn: "APPLICATION_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_USER_IN_GROUP_VIB_GROUP_USER_GROUP_USER_CODE",
                        column: x => x.GROUP_USER_CODE,
                        principalTable: "VIB_GROUP_USER",
                        principalColumn: "GROUP_USER_CODE",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_USER_IN_GROUP_ASP_NET_ROLES_ROLE_ID",
                        column: x => x.ROLE_ID,
                        principalTable: "ASP_NET_ROLES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VIB_USER_IN_GROUP_ASP_NET_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "ASP_NET_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_USER_CLAIMS",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false),
                    CLAIM_TYPE = table.Column<string>(maxLength: 50, nullable: true),
                    CLAIM_VALUE = table.Column<string>(maxLength: 255, nullable: true),
                    USER_ID = table.Column<string>(maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_USER_CLAIMS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ASP_NET_USER_CLAIMS_ASP_NET_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "ASP_NET_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_USER_LOGINS",
                columns: table => new
                {
                    LOGIN_PROVIDER = table.Column<string>(maxLength: 255, nullable: false),
                    PROVIDER_KEY = table.Column<string>(maxLength: 255, nullable: false),
                    PROVIDER_DISPLAY_NAME = table.Column<string>(maxLength: 255, nullable: true),
                    USER_ID = table.Column<string>(maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_USER_LOGINS", x => new { x.LOGIN_PROVIDER, x.PROVIDER_KEY });
                    table.ForeignKey(
                        name: "FK_ASP_NET_USER_LOGINS_ASP_NET_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "ASP_NET_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ASP_NET_USER_ROLES",
                columns: table => new
                {
                    USER_ID = table.Column<string>(maxLength: 50, nullable: false),
                    ROLE_ID = table.Column<string>(maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ASP_NET_USER_ROLES", x => new { x.USER_ID, x.ROLE_ID });
                    table.ForeignKey(
                        name: "FK_ASP_NET_USER_ROLES_ASP_NET_ROLES_ROLE_ID",
                        column: x => x.ROLE_ID,
                        principalTable: "ASP_NET_ROLES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ASP_NET_USER_ROLES_ASP_NET_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "ASP_NET_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VIB_ACCESS_LOG");

            migrationBuilder.DropTable(
                name: "VIB_ACTION_LOG");

            migrationBuilder.DropTable(
                name: "VIB_APP_FUNCTION");

            migrationBuilder.DropTable(
                name: "VIB_DIVISION");

            migrationBuilder.DropTable(
                name: "VIB_JOB_LOG");

            migrationBuilder.DropTable(
                name: "VIB_FM_ACCT_EXEC");

            migrationBuilder.DropTable(
                name: "VIB_LANGUAGE_TEXT");

            migrationBuilder.DropTable(
                name: "VIB_PARAMETER");

            migrationBuilder.DropTable(
                name: "VIB_PERMISSION");

            migrationBuilder.DropTable(
                name: "VIB_PRIVILEGE");

            migrationBuilder.DropTable(
                name: "VIB_USER_IN_GROUP");

            migrationBuilder.DropTable(
                name: "ASP_NET_ROLE_CLAIMS");

            migrationBuilder.DropTable(
                name: "ASP_NET_USER_CLAIMS");

            migrationBuilder.DropTable(
                name: "ASP_NET_USER_LOGINS");

            migrationBuilder.DropTable(
                name: "ASP_NET_USER_ROLES");

            migrationBuilder.DropTable(
                name: "ASP_NET_USER_TOKENS");

            migrationBuilder.DropTable(
                name: "VIB_LANGUAGE");

            migrationBuilder.DropTable(
                name: "VIB_FUNCTION");

            migrationBuilder.DropTable(
                name: "VIB_RESOURCE");

            migrationBuilder.DropTable(
                name: "VIB_APPLICATION");

            migrationBuilder.DropTable(
                name: "VIB_GROUP_USER");

            migrationBuilder.DropTable(
                name: "ASP_NET_ROLES");

            migrationBuilder.DropTable(
                name: "ASP_NET_USERS");

            migrationBuilder.DropTable(
                name: "VIB_ORGANIZATION");
        }
    }
}
