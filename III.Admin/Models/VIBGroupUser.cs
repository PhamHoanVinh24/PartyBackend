using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBGroupUser")]
    public class VIBGroupUser
    {
        public VIBGroupUser()
        {
            VIBUserInGroups = new HashSet<VIBUserInGroup>();
            VIBPermissions = new HashSet<VIBPermission>();
            VIBGroupUserPrivileges = new HashSet<VIBGroupUserPrivilege>();
            //ESGroupApps = new HashSet<ESGroupApp>();
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(20)]
        public string Code { get; set; }

        [StringLength(50)]
        public string Title { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public virtual ICollection<VIBUserInGroup> VIBUserInGroups { get; set; }
        public virtual ICollection<VIBPermission> VIBPermissions { get; set; }
        public virtual ICollection<VIBGroupUserPrivilege> VIBGroupUserPrivileges { get; set; }
        //public virtual ICollection<ESGroupApp> ESGroupApps { get; set; }
    }
}