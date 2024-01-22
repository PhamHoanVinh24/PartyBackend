using System.Collections.Generic;
using System.Linq;
using ESEIM.Models;
using Microsoft.EntityFrameworkCore;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Host.DbContexts;

namespace ESEIM.Utils
{
    public interface ILanguageService
    {
        List<AdLanguage> GetListLanguages();
    }

    public class LanguageService : ILanguageService
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;

        public LanguageService(EIMDBContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        public List<AdLanguage> GetListLanguages()
        {
            return _context.AdLanguages.AsNoTracking().OrderBy(a => a.Ordering).Where(x => x.IsDeleted == false && x.IsEnabled == true).ToList();
        }
    }
}