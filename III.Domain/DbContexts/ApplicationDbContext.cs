using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Host.Entities;
using Microsoft.EntityFrameworkCore.Metadata;
using ESEIM.Models;
using AspNetRole = Host.Entities.AspNetRole;
using III.Domain.Common;

namespace Host.DbContexts
{
    public class ApplicationDbContext :DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public virtual DbSet<AspNetUser> Users { get; set; }
        public virtual DbSet<CommonSetting> CommonSettings { get; set; }
        public virtual DbSet<AdPermission> AdPermissions { get; set; }
        public virtual DbSet<AdLanguage> AdLanguages { get; set; }
        public virtual DbSet<AdUserInGroup> AdUserInGroups { get; set; }
        public virtual DbSet<AdActionLog> AdActionLogs { get; set; }
        public virtual DbSet<AdOrganization> AdOrganizations { get; set; }
        public virtual DbSet<Project> Projects { get; set; }
        public virtual DbSet<PoSaleHeader> PoSaleHeaders { get; set; }
        #region OTP
        public virtual DbSet<OTPManager> OTPManagers { get; set; }
        #endregion

        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region Builder entity

            //modelBuilder.Entity<AspNetRole>(entity =>
            //{
            //    entity.Property(e => e.Id).HasMaxLength(50).HasColumnName("RoleId");
            //    entity.Property(e => e.ConcurrencyStamp).HasMaxLength(255);
            //    entity.Property(e => e.Name).HasMaxLength(255);
            //    entity.Property(e => e.NormalizedName).HasMaxLength(255);

            //    entity.HasIndex(e => e.NormalizedName).HasName("IX_ROLES_NAME").IsUnique();
            //});

            modelBuilder.Entity<AspNetUser>(entity =>
            {

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

            });

            //modelBuilder.Entity<AdApplication>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdFunction>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdAppFunction>(entity =>
            //{

            //});
            //modelBuilder.Entity<MobileAppFunction>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdGroupUser>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdOrganization>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdParameter>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdPermission>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdPrivilege>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdResource>(entity =>
            //{

            //});

            //modelBuilder.Entity<AdUserInGroup>(entity =>
            //{

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