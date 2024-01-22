using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBPermission")]
    public class VIBPermission
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? ApplicationId { get; set; }
        public virtual VIBApplication Application { get; set; }

        public int? FunctionId { get; set; }
        public virtual VIBFunction Function { get; set; }

        public int? ResourceId { get; set; }
        public virtual VIBResource Resource { get; set; }

        public int? GroupUserId { get; set; }
        public virtual VIBGroupUser GroupUser { get; set; }

        [StringLength(50)]
        public string UserId { get; set; }
        public virtual AspNetUser User { get; set; }

        [StringLength(50)]
        public string RoleId { get; set; }
        public virtual AspNetRole Role { get; set; }
    }
}