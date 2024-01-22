using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CONTACT")]
    public class Contact
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ContactName { get; set; }

        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(100)]
        public string Telephone { get; set; }

        [StringLength(100)]
        public string MobilePhone { get; set; }

        [StringLength(100)]
        public string Fax { get; set; }

        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(1000)]
        public string Note { get; set; }

        public int? UserId { get; set; }

        public DateTime? CreateTime { get; set; }

        public DateTime? UpdateTime { get; set; }

        [StringLength(200)]
        public string Facebook { get; set; }

        [StringLength(200)]
        public string GooglePlus { get; set; }

        [StringLength(200)]
        public string Skype { get; set; }

        [StringLength(200)]
        public string Twitter { get; set; }

        [StringLength(255)]
        public string Image { get; set; }

        [NotMapped]
        public int? CusId { get; set; }

        [StringLength(100)]
        public string CusCode { get; set; }


        [NotMapped]
        public int? SuppId { get; set; }

        [StringLength(100)]
        public string SuppCode { get; set; }

        public bool? Flag { get; set; }

        [StringLength(255)]
        public string FilePath { get; set; }

        [StringLength(1000)]
        public string Title { get; set; }

        [StringLength(1000)]
        public string InChargeOf { get; set; }

        public bool IsDeleted { get; set; }
    }
}
