using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBUserInGroup")]
    public class VIBUserInGroup
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int GroupUserId { get; set; }
        public virtual VIBGroupUser GroupUser { get; set; }

        public string UserId { get; set; }
        public virtual AspNetUser User { get; set; }

        public string RoleId { get; set; }
        public virtual AspNetRole Role { get; set; }
    }
}