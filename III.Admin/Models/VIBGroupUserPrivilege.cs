using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBGroupUserPrivilege")]
    public class VIBGroupUserPrivilege
    {
        public int GroupUserId { get; set; }
        public virtual VIBGroupUser GroupUser { get; set; }

        public int PrivilegeId { get; set; }
        public virtual VIBPrivilege Privilege { get; set; }
    }
}