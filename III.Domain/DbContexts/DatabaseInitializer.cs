using Host.DbContexts;
using Host.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace III.Domain.DbContexts
{
    public interface IDatabaseInitializer
    {
        Task SeedAsync();
        Task<ApplicationUser> CreateUserAsync(string userName, string password, string email, string fullName, string phoneNumber);
    }

    public class DatabaseInitializer : IDatabaseInitializer
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger _logger;

        public DatabaseInitializer(
            ApplicationDbContext context
            , UserManager<ApplicationUser> userManager
            , ILogger<DatabaseInitializer> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            await _context.Database.MigrateAsync().ConfigureAwait(false);

            if (!await _context.Users.AnyAsync())
            {
                await CreateUserAsync("admin", "Vib@2017", "thaodn2@fpt.com.vn", "Admin Root", "0123456789");
            }
        }

        public async Task<ApplicationUser> CreateUserAsync(string userName, string password, string email, string fullName, string phoneNumber)
        {
            ApplicationUser applicationUser = null;
            try
            {
                applicationUser = await _userManager.FindByNameAsync(userName);
                if (applicationUser == null)
                {
                    applicationUser = new ApplicationUser
                    {
                        UserName = userName,
                        Email = email,
                        NormalizedUserName = userName.ToUpper(),
                        NormalizedEmail = email.ToUpper(),
                        PhoneNumber = phoneNumber,
                        EmailConfirmed = true,
                        GivenName = fullName,
                        Active = true,
                        CreatedDate = DateTime.Now,
                    };

                    var result = await _userManager.CreateAsync(applicationUser, password);
                }
            }
            catch (Exception)
            {

            }

            return applicationUser;
        }
    }
}
