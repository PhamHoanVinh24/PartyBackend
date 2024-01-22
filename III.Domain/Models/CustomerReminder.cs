using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("CUSTOMER_REMINDER")]
    public class CustomerReminder
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int CustomerId { get; set; }

        [StringLength(100), Required]
        public string ReminderCode { get; set; }

        public DateTime? ReminderTime { get; set; }

        [NotMapped, Required]
        public string ReminderTimeView { get; set; }

        [Required]
        public string Note { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

    }
}
