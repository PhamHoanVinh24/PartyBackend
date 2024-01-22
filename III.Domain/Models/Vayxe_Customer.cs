using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    [Table("Vayxe_Customer")]
    public class Vayxe_Customer
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 50)]
        public string LastName { get; set; }
        [StringLength(maximumLength: 50)]
        public string FirstName { get; set; }
        [StringLength(maximumLength: 50)]
        public string Password { get; set; }
        [StringLength(maximumLength: 50)]
        public string Email { get; set; }
        [StringLength(maximumLength: 15)]
        public string Phone { get; set; }
        [StringLength(maximumLength: 150)]
        public string Social_Id { get; set; }
        public int Active { get; set; }
        public int isSocial { get; set; }

        [StringLength(maximumLength: 15)]
        public string Code_share { get; set; }

        public int Point_bonus { get; set; }

        public int Total_trip { get; set; }

        [StringLength(maximumLength: 250)]
        public string Profile_picture { get; set; }
        public double Balance_credit { get; set; }

        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? UpdatedBy { get; set; }
    
    }
}
