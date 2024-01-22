using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AdGroupUserPrivilege")]
    public class AdGroupUserPrivilege
    {
        public int GroupUserId { get; set; }
        public virtual AdGroupUser GroupUser { get; set; }

        public int PrivilegeId { get; set; }
        public virtual AdPrivilege Privilege { get; set; }
    }
}