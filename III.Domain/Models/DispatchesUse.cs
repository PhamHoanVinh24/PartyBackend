using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("DISPATCHES_USER")]
    public class DispatchesUser
    {
        [Key]
        public string GroupUserCode { get; set; }

        public string UserId { get; set; }
    }
}
